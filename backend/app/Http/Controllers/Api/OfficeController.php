<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Office\IndexOfficeRequest;
use App\Http\Requests\Office\StoreOfficeRequest;
use App\Http\Requests\Office\UpdateOfficeRequest;
use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OfficeController extends Controller
{
    public function index(IndexOfficeRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Office::class);

        $data = $request->validated();
        $query = Office::query()
            ->with('parent:id,name,code,type,parent_id')
            ->withCount(['children', 'users'])
            ->orderByRaw("case type when 'city' then 1 when 'subcity' then 2 when 'woreda' then 3 when 'zone' then 4 else 5 end")
            ->orderBy('name');

        $this->applyVisibleScope($query, $request->user());

        if (! empty($data['type'])) {
            $query->where('type', $data['type']);
        }

        if (array_key_exists('parent_id', $data)) {
            $query->where('parent_id', $data['parent_id']);
        }

        if (! empty($data['search'])) {
            $search = trim($data['search']);
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $status = $data['status'] ?? 'active';
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($request->boolean('all')) {
            $offices = $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Offices retrieved successfully',
                'data' => $offices->map(fn (Office $office) => $this->officePayload($office))->values(),
                'meta' => [
                    'current_page' => 1,
                    'per_page' => $offices->count(),
                    'total' => $offices->count(),
                    'last_page' => 1,
                ],
            ]);
        }

        $perPage = max(1, min((int) ($data['per_page'] ?? 10), 100));
        $offices = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Offices retrieved successfully',
            'data' => collect($offices->items())->map(fn (Office $office) => $this->officePayload($office))->values(),
            'meta' => [
                'current_page' => $offices->currentPage(),
                'per_page' => $offices->perPage(),
                'total' => $offices->total(),
                'last_page' => $offices->lastPage(),
            ],
        ]);
    }

    public function tree(IndexOfficeRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Office::class);

        $query = Office::query()
            ->with('parent:id,name,code,type,parent_id')
            ->withCount(['children', 'users'])
            ->orderByRaw("case type when 'city' then 1 when 'subcity' then 2 when 'woreda' then 3 when 'zone' then 4 else 5 end")
            ->orderBy('name');

        $this->applyVisibleScope($query, $request->user());

        if (($request->validated()['status'] ?? 'active') === 'active') {
            $query->where('is_active', true);
        } elseif (($request->validated()['status'] ?? 'active') === 'inactive') {
            $query->where('is_active', false);
        }

        $offices = $query->get();
        $visibleIds = $offices->pluck('id')->map(fn ($id) => (int) $id)->all();
        $byParent = $offices->groupBy(fn (Office $office) => $office->parent_id ?: 0);
        $roots = $offices->filter(fn (Office $office) => ! $office->parent_id || ! in_array((int) $office->parent_id, $visibleIds, true));

        $build = function (Office $office) use (&$build, $byParent) {
            $payload = $this->officePayload($office);
            $payload['children'] = ($byParent[$office->id] ?? collect())
                ->map(fn (Office $child) => $build($child))
                ->values();

            return $payload;
        };

        return response()->json([
            'success' => true,
            'message' => 'Office hierarchy retrieved successfully',
            'data' => $roots->map(fn (Office $office) => $build($office))->values(),
        ]);
    }

    public function store(StoreOfficeRequest $request): JsonResponse
    {
        $this->authorize('create', Office::class);

        $data = $request->validated();
        $user = $request->user();

        $this->assertCanManageType($user, $data['type']);
        $this->validateHierarchy($data['type'], $data['parent_id'] ?? null);
        $this->assertParentVisible($user, $data['parent_id'] ?? null);

        $office = Office::create([
            'name' => $data['name'],
            'code' => $this->resolveCode($data['code'] ?? null, $data['name'], $data['type'], $data['parent_id'] ?? null),
            'type' => $data['type'],
            'parent_id' => $data['parent_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Office created successfully',
            'data' => $this->officePayload($office->load('parent')->loadCount(['children', 'users'])),
        ], 201);
    }

    public function show(Request $request, Office $office): JsonResponse
    {
        $this->authorize('view', $office);
        $this->assertOfficeVisible($request->user(), $office);

        return response()->json([
            'success' => true,
            'message' => 'Office retrieved successfully',
            'data' => $this->officePayload($office->load('parent', 'children')->loadCount(['children', 'users'])),
        ]);
    }

    public function update(UpdateOfficeRequest $request, Office $office): JsonResponse
    {
        $this->authorize('update', $office);
        $this->assertOfficeVisible($request->user(), $office);

        $data = $request->validated();
        $user = $request->user();

        $this->assertCanManageOffice($user, $office);
        $this->assertCanManageType($user, $data['type']);
        $this->validateHierarchy($data['type'], $data['parent_id'] ?? null, $office);
        $this->assertParentVisible($user, $data['parent_id'] ?? null);

        if ($office->children()->exists() && $office->type !== $data['type']) {
            throw ValidationException::withMessages([
                'type' => ['Cannot change office type while it has child offices.'],
            ]);
        }

        $office->update([
            'name' => $data['name'],
            'code' => $this->resolveCode($data['code'] ?? $office->code, $data['name'], $data['type'], $data['parent_id'] ?? null, $office->id),
            'type' => $data['type'],
            'parent_id' => $data['parent_id'] ?? null,
            'is_active' => $data['is_active'] ?? $office->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Office updated successfully',
            'data' => $this->officePayload($office->fresh(['parent'])->loadCount(['children', 'users'])),
        ]);
    }

    public function toggle(Request $request, Office $office): JsonResponse
    {
        $this->authorize('toggle', $office);
        $this->assertOfficeVisible($request->user(), $office);
        $this->assertCanManageOffice($request->user(), $office);

        $office->forceFill(['is_active' => ! $office->is_active])->save();

        return response()->json([
            'success' => true,
            'message' => 'Office status updated successfully',
            'data' => $this->officePayload($office->fresh(['parent'])->loadCount(['children', 'users'])),
        ]);
    }

    public function destroy(Request $request, Office $office): JsonResponse
    {
        $this->authorize('delete', $office);
        $this->assertOfficeVisible($request->user(), $office);
        $this->assertCanManageOffice($request->user(), $office);

        $dependencies = $this->dependencyCounts($office);
        if (array_sum($dependencies) > 0) {
            throw ValidationException::withMessages([
                'office' => ['Cannot delete office while child offices, users, or citizens are attached. Deactivate it instead.'],
            ]);
        }

        $office->delete();

        return response()->json([
            'success' => true,
            'message' => 'Office deleted successfully',
            'data' => null,
        ]);
    }

    protected function officePayload(Office $office): array
    {
        $dependencies = $this->dependencyCounts($office);

        return [
            'id' => $office->id,
            'name' => $office->name,
            'code' => $office->code,
            'type' => $office->type,
            'parent_id' => $office->parent_id,
            'parent' => $office->relationLoaded('parent') && $office->parent ? [
                'id' => $office->parent->id,
                'name' => $office->parent->name,
                'code' => $office->parent->code,
                'type' => $office->parent->type,
                'parent_id' => $office->parent->parent_id,
            ] : null,
            'is_active' => (bool) $office->is_active,
            'children_count' => (int) ($office->children_count ?? $dependencies['children']),
            'users_count' => (int) ($office->users_count ?? $dependencies['users']),
            'citizens_count' => (int) $dependencies['citizens'],
            'can_delete' => array_sum($dependencies) === 0,
            'created_at' => $office->created_at,
            'updated_at' => $office->updated_at,
        ];
    }

    protected function validateHierarchy(string $type, ?int $parentId, ?Office $currentOffice = null): void
    {
        if ($type === Office::TYPE_CITY) {
            if ($parentId !== null) {
                throw ValidationException::withMessages([
                    'parent_id' => ['City offices cannot have a parent.'],
                ]);
            }

            return;
        }

        if ($parentId === null) {
            throw ValidationException::withMessages([
                'parent_id' => ['Parent office is required for subcity, woreda, and zone.'],
            ]);
        }

        if ($currentOffice && (int) $currentOffice->id === (int) $parentId) {
            throw ValidationException::withMessages([
                'parent_id' => ['An office cannot be its own parent.'],
            ]);
        }

        $parent = Office::findOrFail($parentId);
        $expectedParentType = match ($type) {
            Office::TYPE_SUBCITY => Office::TYPE_CITY,
            Office::TYPE_WOREDA => Office::TYPE_SUBCITY,
            Office::TYPE_ZONE => Office::TYPE_WOREDA,
            default => null,
        };

        if ($parent->type !== $expectedParentType) {
            throw ValidationException::withMessages([
                'parent_id' => ["{$type} must belong to a {$expectedParentType} office."],
            ]);
        }

        if ($currentOffice && $this->isDescendantOf($parent, $currentOffice)) {
            throw ValidationException::withMessages([
                'parent_id' => ['Cannot set a descendant office as parent.'],
            ]);
        }
    }

    protected function resolveCode(?string $code, string $name, string $type, ?int $parentId, ?int $ignoreId = null): string
    {
        $base = trim((string) $code);

        if ($base === '') {
            $prefix = $parentId ? (Office::find($parentId)?->code ?? strtoupper($type)) : strtoupper($type);
            $slug = strtoupper(Str::slug($name));
            $base = trim($prefix . '-' . ($slug ?: strtoupper($type)), '-');
        }

        $base = strtoupper(Str::slug($base));
        $candidate = $base;
        $counter = 2;

        while (
            Office::query()
                ->where('code', $candidate)
                ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $base . '-' . $counter;
            $counter++;
        }

        return $candidate;
    }

    protected function dependencyCounts(Office $office): array
    {
        $citizens = 0;

        if (Schema::hasTable('citizens')) {
            $column = match ($office->type) {
                Office::TYPE_CITY => 'city_id',
                Office::TYPE_SUBCITY => 'subcity_id',
                Office::TYPE_WOREDA => 'woreda_id',
                Office::TYPE_ZONE => 'zone_id',
                default => null,
            };

            if ($column) {
                $citizens = (int) \Illuminate\Support\Facades\DB::table('citizens')->where($column, $office->id)->count();
            }
        }

        return [
            'children' => (int) $office->children()->count(),
            'users' => (int) $office->users()->count(),
            'citizens' => $citizens,
        ];
    }

    protected function applyVisibleScope(Builder $query, User $user): void
    {
        $ids = $this->visibleOfficeIds($user);

        if ($ids === null) {
            return;
        }

        $ids === [] ? $query->whereRaw('1 = 0') : $query->whereIn('id', $ids);
    }

    protected function assertOfficeVisible(User $user, Office $office): void
    {
        $ids = $this->visibleOfficeIds($user);

        if ($ids !== null && ! in_array((int) $office->id, $ids, true)) {
            abort(404);
        }
    }

    protected function assertParentVisible(User $user, ?int $parentId): void
    {
        if ($parentId === null) {
            return;
        }

        $ids = $this->visibleOfficeIds($user);

        if ($ids !== null && ! in_array((int) $parentId, $ids, true)) {
            throw ValidationException::withMessages([
                'parent_id' => ['Selected parent office is outside your administrative scope.'],
            ]);
        }
    }

    protected function assertCanManageOffice(User $user, Office $office): void
    {
        if (! in_array($office->type, $this->manageableTypes($user), true)) {
            throw ValidationException::withMessages([
                'office' => ['You cannot manage this office level.'],
            ]);
        }
    }

    protected function assertCanManageType(User $user, string $type): void
    {
        if (! in_array($type, $this->manageableTypes($user), true)) {
            throw ValidationException::withMessages([
                'type' => ['You cannot manage this office level.'],
            ]);
        }
    }

    protected function manageableTypes(User $user): array
    {
        if ($this->isSuperAdmin($user)) {
            return [Office::TYPE_CITY, Office::TYPE_SUBCITY, Office::TYPE_WOREDA, Office::TYPE_ZONE];
        }

        if (! $user->hasRole('Admin')) {
            return [];
        }

        return match ($user->admin_level) {
            Office::TYPE_CITY => [Office::TYPE_SUBCITY, Office::TYPE_WOREDA, Office::TYPE_ZONE],
            Office::TYPE_SUBCITY => [Office::TYPE_WOREDA, Office::TYPE_ZONE],
            Office::TYPE_WOREDA => [Office::TYPE_ZONE],
            default => [],
        };
    }

    protected function visibleOfficeIds(User $user): ?array
    {
        if ($this->isSuperAdmin($user)) {
            return null;
        }

        if (! $user->office_id) {
            return [];
        }

        return array_values(array_unique([(int) $user->office_id, ...$this->descendantIds((int) $user->office_id)]));
    }

    protected function descendantIds(int $officeId): array
    {
        $ids = [];
        $queue = [$officeId];

        while ($queue !== []) {
            $children = Office::query()
                ->whereIn('parent_id', $queue)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $new = array_values(array_diff($children, $ids));
            $ids = array_merge($ids, $new);
            $queue = $new;
        }

        return $ids;
    }

    protected function isDescendantOf(Office $candidate, Office $ancestor): bool
    {
        $current = $candidate;

        while ($current->parent_id) {
            if ((int) $current->parent_id === (int) $ancestor->id) {
                return true;
            }

            $current = Office::find($current->parent_id);
            if (! $current) {
                return false;
            }
        }

        return false;
    }

    protected function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('Super Admin');
    }
}
