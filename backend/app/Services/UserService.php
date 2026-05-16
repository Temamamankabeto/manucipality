<?php

namespace App\Services;

use App\Models\Office;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class UserService
{
    public function paginateUsers(array $filters, ?User $actor = null): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));
        $search = trim((string) ($filters['search'] ?? ''));
        $status = $filters['status'] ?? null;
        $role = $filters['role'] ?? null;
        $adminLevel = $filters['admin_level'] ?? null;

        $query = User::query()
            ->with(['roles:id,name,guard_name', 'office:id,name,type,code,parent_id', 'subCity:id,name,type,code,parent_id', 'woreda:id,name,type,code,parent_id', 'zone:id,name,type,code,parent_id']);

        if ($actor) {
            $query->visibleTo($actor);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'disabled') {
            $query->where('is_active', false);
        }

        if ($role) {
            $query->role($role, 'sanctum');
        }

        if ($adminLevel) {
            $query->where('admin_level', $adminLevel);
        }

        foreach (['office_id', 'sub_city_id', 'woreda_id', 'zone_id'] as $column) {
            if (! empty($filters[$column])) {
                $query->where($column, $filters[$column]);
            }
        }

        return $query->latest()->paginate($perPage);
    }

    public function transformPaginatedUsers(LengthAwarePaginator $users): array
    {
        return [
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => collect($users->items())->map(fn (User $user) => $this->transformUser($user))->values(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ];
    }

    public function transformUser(User $user): array
    {
        $user->loadMissing(['roles:id,name,guard_name', 'office:id,name,type,code,parent_id', 'subCity:id,name,type,code,parent_id', 'woreda:id,name,type,code,parent_id', 'zone:id,name,type,code,parent_id']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'status' => $user->is_active ? 'active' : 'disabled',
            'role' => $user->roles->pluck('name')->first(),
            'roles' => $user->roles->map(fn ($role) => ['id' => $role->id, 'name' => $role->name])->values(),
            'admin_level' => $user->admin_level,
            'office_id' => $user->office_id,
            'sub_city_id' => $user->sub_city_id,
            'woreda_id' => $user->woreda_id,
            'zone_id' => $user->zone_id,
            'office' => $this->officePayload($user->office),
            'sub_city' => $this->officePayload($user->subCity),
            'woreda' => $this->officePayload($user->woreda),
            'zone' => $this->officePayload($user->zone),
            'profile_image_url' => $user->profile_image_url,
            'last_login_at' => $user->last_login_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    public function getUser(int|string $id, ?User $actor = null): User
    {
        $query = User::query()
            ->with(['roles:id,name,guard_name', 'office:id,name,type,code,parent_id', 'subCity:id,name,type,code,parent_id', 'woreda:id,name,type,code,parent_id', 'zone:id,name,type,code,parent_id']);

        if ($actor) {
            $query->visibleTo($actor);
        }

        return $query->findOrFail($id);
    }

    public function getRolesLite(?User $actor = null)
    {
        $query = Role::query()
            ->where('guard_name', 'sanctum')
            ->whereIn('name', [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN])
            ->select('id', 'name')
            ->orderBy('name');

        if ($actor && ! $actor->isSuperAdmin()) {
            $query->where('name', User::ROLE_ADMIN);
        }

        return $query->get();
    }

    public function getOfficesLite(?User $actor = null, ?string $type = null, int|string|null $parentId = null)
    {
        $query = Office::query()
            ->active()
            ->select('id', 'name', 'code', 'type', 'parent_id')
            ->orderBy('type')
            ->orderBy('name');

        if ($type) {
            $query->where('type', $type);
        }

        if ($parentId) {
            $query->where('parent_id', $parentId);
        }

        if ($actor && ! $actor->isSuperAdmin() && $actor->isAdmin() && $actor->admin_level !== User::LEVEL_CITY) {
            $query->where(function ($q) use ($actor) {
                if ($actor->office_id) {
                    $q->whereKey($actor->office_id)->orWhere('parent_id', $actor->office_id);
                }

                if ($actor->sub_city_id) {
                    $q->orWhere('id', $actor->sub_city_id)->orWhere('parent_id', $actor->sub_city_id);
                }

                if ($actor->woreda_id) {
                    $q->orWhere('id', $actor->woreda_id)->orWhere('parent_id', $actor->woreda_id);
                }

                if ($actor->zone_id) {
                    $q->orWhere('id', $actor->zone_id);
                }
            });
        }

        return $query->get();
    }

    public function createUser(array $data, User $actor): User
    {
        $role = $this->findRole($data['role']);
        $scope = $this->normalizeOfficeScope($data);
        $adminLevel = $this->normalizeAdminLevel($role->name, $data['admin_level'] ?? null, $scope);

        $this->ensureRoleAssignable($actor, $role->name, $adminLevel);
        $this->ensureScopeAssignable($actor, $adminLevel, $scope);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $data['address'] ?? null,
            'password' => Hash::make($data['password']),
            'is_active' => true,
            'admin_level' => $adminLevel,
            ...$scope,
        ]);

        $user->syncRoles([$role->name]);

        return $user->load(['roles', 'office', 'subCity', 'woreda', 'zone']);
    }

    public function updateUser(User $user, array $data, User $actor): User
    {
        $role = $this->findRole($data['role']);
        $scope = $this->normalizeOfficeScope($data);
        $adminLevel = $this->normalizeAdminLevel($role->name, $data['admin_level'] ?? null, $scope);

        $this->ensureRoleAssignable($actor, $role->name, $adminLevel);
        $this->ensureScopeAssignable($actor, $adminLevel, $scope);

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $data['address'] ?? $user->address,
            'admin_level' => $adminLevel,
            ...$scope,
        ]);

        $user->syncRoles([$role->name]);

        return $user->load(['roles', 'office', 'subCity', 'woreda', 'zone']);
    }

    public function assignRole(User $user, string $roleName, User $actor): User
    {
        $role = $this->findRole($roleName);
        $adminLevel = $roleName === User::ROLE_SUPER_ADMIN ? null : ($user->admin_level ?: User::LEVEL_ZONE);

        $this->ensureRoleAssignable($actor, $role->name, $adminLevel);

        $user->forceFill(['admin_level' => $adminLevel])->save();
        $user->syncRoles([$role->name]);

        return $user->load(['roles', 'office', 'subCity', 'woreda', 'zone']);
    }

    public function toggleUser(User $user): User
    {
        $user->forceFill(['is_active' => ! $user->is_active])->save();

        return $user->load(['roles', 'office', 'subCity', 'woreda', 'zone']);
    }

    public function resetPassword(User $user, string $newPassword): User
    {
        $user->forceFill(['password' => Hash::make($newPassword)])->save();

        return $user;
    }


    public function updateProfile(User $user, array $data, ?UploadedFile $profileFile = null): User
    {
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->phone = $data['phone'];

        if (! empty($data['new_password'])) {
            if (empty($data['old_password'])) {
                throw ValidationException::withMessages(['old_password' => ['Old password is required when setting a new password.']]);
            }

            if (! Hash::check($data['old_password'], $user->password)) {
                throw ValidationException::withMessages(['old_password' => ['The provided old password is incorrect.']]);
            }

            $user->password = Hash::make($data['new_password']);
        }

        if ($profileFile) {
            if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $user->profile_image = $profileFile->store('users/profile-images', 'public');
        }

        $user->save();

        return $user->load(['roles', 'office', 'subCity', 'woreda', 'zone']);
    }

    public function deleteUser(User $user, ?int $authId = null): void
    {
        if ($authId && $authId === $user->id) {
            throw ValidationException::withMessages(['user' => ['You cannot delete your own account.']]);
        }

        $user->syncRoles([]);

        if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
            Storage::disk('public')->delete($user->profile_image);
        }

        $user->delete();
    }

 protected function normalizeOfficeScope(array $data): array
 {
 $scope = [
 'office_id' => $data['office_id'] ?? null,
 'sub_city_id' => $data['sub_city_id'] ?? null,
 'woreda_id' => $data['woreda_id'] ?? null,
 'zone_id' => $data['zone_id'] ?? null,
 ];

 $selectedOfficeId =
 $scope['zone_id']
 ?? $scope['woreda_id']
 ?? $scope['sub_city_id']
 ?? $scope['office_id']
 ?? null;

 if ($selectedOfficeId) {
 $office = Office::query()
 ->with('parent.parent.parent')
 ->findOrFail($selectedOfficeId);

 $current = $office;

 while ($current) {
 if ($current->type === Office::TYPE_SUBCITY) {
 $scope['sub_city_id'] = $current->id;
 }

 if ($current->type === Office::TYPE_WOREDA) {
 $scope['woreda_id'] = $current->id;
 }

 if ($current->type === Office::TYPE_ZONE) {
 $scope['zone_id'] = $current->id;
 }

 $current = $current->parent;
 }

 // office_id is only the exact assigned office for city/subcity/woreda.
 // For zone admin, we keep office_id null and use zone_id.
 $scope['office_id'] = match ($office->type) {
 Office::TYPE_CITY,
 Office::TYPE_SUBCITY,
 Office::TYPE_WOREDA => $office->id,
 Office::TYPE_ZONE => null,
 default => null,
 };
 }

 return $scope;
 }
    protected function normalizeAdminLevel(string $roleName, ?string $adminLevel, array $scope): ?string
    {
        if ($roleName === User::ROLE_SUPER_ADMIN) {
            return null;
        }

        $adminLevel = $adminLevel ?: User::LEVEL_ZONE;

        if (! in_array($adminLevel, [User::LEVEL_CITY, User::LEVEL_SUBCITY, User::LEVEL_WOREDA, User::LEVEL_ZONE], true)) {
            throw ValidationException::withMessages(['admin_level' => ['Invalid admin level.']]);
        }

        if ($adminLevel === User::LEVEL_SUBCITY && empty($scope['sub_city_id'])) {
            throw ValidationException::withMessages(['sub_city_id' => ['Subcity is required for subcity admin.']]);
        }

        if ($adminLevel === User::LEVEL_WOREDA && empty($scope['woreda_id'])) {
            throw ValidationException::withMessages(['woreda_id' => ['Woreda is required for woreda admin.']]);
        }

        if ($adminLevel === User::LEVEL_ZONE && empty($scope['zone_id'])) {
            throw ValidationException::withMessages(['zone_id' => ['Zone is required for zone admin.']]);
        }

        return $adminLevel;
    }

    protected function ensureScopeAssignable(User $actor, ?string $targetLevel, array $scope): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if (! $actor->isAdmin()) {
            $this->denyScope();
        }

        if ($this->levelRank($targetLevel) > $this->levelRank($actor->admin_level)) {
            throw ValidationException::withMessages(['admin_level' => ['You cannot assign a higher administrative level.']]);
        }

        if ($actor->admin_level === User::LEVEL_SUBCITY && $actor->sub_city_id !== ($scope['sub_city_id'] ?? null)) {
            $this->denyScope();
        }

        if ($actor->admin_level === User::LEVEL_WOREDA && $actor->woreda_id !== ($scope['woreda_id'] ?? null)) {
            $this->denyScope();
        }

        if ($actor->admin_level === User::LEVEL_ZONE && $actor->zone_id !== ($scope['zone_id'] ?? null)) {
            $this->denyScope();
        }
    }

    protected function ensureRoleAssignable(User $actor, string $roleName, ?string $targetLevel): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if ($roleName === User::ROLE_SUPER_ADMIN) {
            throw ValidationException::withMessages(['role' => ['Only Super Admin can assign Super Admin.']]);
        }

        if (! $actor->isAdmin()) {
            throw ValidationException::withMessages(['role' => ['You cannot assign this role.']]);
        }

        if ($this->levelRank($targetLevel) > $this->levelRank($actor->admin_level)) {
            throw ValidationException::withMessages(['admin_level' => ['You cannot assign a higher administrative level.']]);
        }
    }

    protected function levelRank(?string $level): int
    {
        return match ($level) {
            User::LEVEL_CITY => 80,
            User::LEVEL_SUBCITY => 70,
            User::LEVEL_WOREDA => 60,
            User::LEVEL_ZONE => 50,
            default => 0,
        };
    }

    protected function denyScope(): void
    {
        throw ValidationException::withMessages(['office_id' => ['Selected office is outside your administrative scope.']]);
    }

    protected function findRole(string $roleName): Role
    {
        return Role::query()
            ->where('name', $roleName)
            ->where('guard_name', 'sanctum')
            ->firstOrFail();
    }

    protected function officePayload(?Office $office): ?array
    {
        if (! $office) {
            return null;
        }

        return [
            'id' => $office->id,
            'name' => $office->name,
            'type' => $office->type,
            'code' => $office->code,
            'parent_id' => $office->parent_id,
        ];
    }
}
