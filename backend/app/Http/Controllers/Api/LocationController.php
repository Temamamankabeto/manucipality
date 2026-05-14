<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LocationController extends Controller
{
    public function tree(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Office::class);

        $query = Office::query()
            ->with('parent:id,name,code,type,parent_id')
            ->withCount(['children', 'users'])
            ->orderByRaw("case type when 'city' then 1 when 'subcity' then 2 when 'woreda' then 3 when 'zone' then 4 else 5 end")
            ->orderBy('name');

        $this->applyVisibleScope($query, $request->user());
        $this->applyStatus($query, $request->query('status', 'active'));

        $offices = $query->get();
        $visibleIds = $offices->pluck('id')->map(fn ($id) => (int) $id)->all();
        $byParent = $offices->groupBy(fn (Office $office) => $office->parent_id ?: 0);
        $roots = $offices->filter(fn (Office $office) => ! $office->parent_id || ! in_array((int) $office->parent_id, $visibleIds, true));

        $build = function (Office $office) use (&$build, $byParent) {
            $payload = $this->payload($office);
            $payload['children'] = ($byParent[$office->id] ?? collect())
                ->map(fn (Office $child) => $build($child))
                ->values();

            return $payload;
        };

        return $this->ok('Location hierarchy retrieved successfully', $roots->map(fn (Office $office) => $build($office))->values());
    }

    public function cities(Request $request): JsonResponse
    {
        return $this->index($request, Office::TYPE_CITY);
    }

    public function city(Request $request, Office $city): JsonResponse
    {
        return $this->show($request, $city, Office::TYPE_CITY);
    }

    public function storeCity(Request $request): JsonResponse
    {
        return $this->store($request, Office::TYPE_CITY);
    }

    public function updateCity(Request $request, Office $city): JsonResponse
    {
        return $this->update($request, $city, Office::TYPE_CITY);
    }

    public function toggleCity(Request $request, Office $city): JsonResponse
    {
        return $this->toggle($request, $city, Office::TYPE_CITY);
    }

    public function destroyCity(Request $request, Office $city): JsonResponse
    {
        return $this->destroy($request, $city, Office::TYPE_CITY);
    }

    public function citySubcities(Request $request, Office $city): JsonResponse
    {
        $this->assertType($city, Office::TYPE_CITY);
        $request->merge(['city_id' => $city->id, 'all' => true]);

        return $this->index($request, Office::TYPE_SUBCITY, $city->id);
    }

    public function subcities(Request $request): JsonResponse
    {
        return $this->index($request, Office::TYPE_SUBCITY, $request->query('city_id'));
    }

    public function subcity(Request $request, Office $subcity): JsonResponse
    {
        return $this->show($request, $subcity, Office::TYPE_SUBCITY);
    }

    public function storeSubcity(Request $request): JsonResponse
    {
        return $this->store($request, Office::TYPE_SUBCITY);
    }

    public function updateSubcity(Request $request, Office $subcity): JsonResponse
    {
        return $this->update($request, $subcity, Office::TYPE_SUBCITY);
    }

    public function toggleSubcity(Request $request, Office $subcity): JsonResponse
    {
        return $this->toggle($request, $subcity, Office::TYPE_SUBCITY);
    }

    public function destroySubcity(Request $request, Office $subcity): JsonResponse
    {
        return $this->destroy($request, $subcity, Office::TYPE_SUBCITY);
    }

    public function subcityWoredas(Request $request, Office $subcity): JsonResponse
    {
        $this->assertType($subcity, Office::TYPE_SUBCITY);
        $request->merge(['subcity_id' => $subcity->id, 'all' => true]);

        return $this->index($request, Office::TYPE_WOREDA, $subcity->id);
    }

    public function woredas(Request $request): JsonResponse
    {
        return $this->index($request, Office::TYPE_WOREDA, $request->query('subcity_id'));
    }

    public function woreda(Request $request, Office $woreda): JsonResponse
    {
        return $this->show($request, $woreda, Office::TYPE_WOREDA);
    }

    public function storeWoreda(Request $request): JsonResponse
    {
        return $this->store($request, Office::TYPE_WOREDA);
    }

    public function updateWoreda(Request $request, Office $woreda): JsonResponse
    {
        return $this->update($request, $woreda, Office::TYPE_WOREDA);
    }

    public function toggleWoreda(Request $request, Office $woreda): JsonResponse
    {
        return $this->toggle($request, $woreda, Office::TYPE_WOREDA);
    }

    public function destroyWoreda(Request $request, Office $woreda): JsonResponse
    {
        return $this->destroy($request, $woreda, Office::TYPE_WOREDA);
    }

    public function woredaZones(Request $request, Office $woreda): JsonResponse
    {
        $this->assertType($woreda, Office::TYPE_WOREDA);
        $request->merge(['woreda_id' => $woreda->id, 'all' => true]);

        return $this->index($request, Office::TYPE_ZONE, $woreda->id);
    }

    public function zones(Request $request): JsonResponse
    {
        return $this->index($request, Office::TYPE_ZONE, $request->query('woreda_id'));
    }

    public function zone(Request $request, Office $zone): JsonResponse
    {
        return $this->show($request, $zone, Office::TYPE_ZONE);
    }

    public function storeZone(Request $request): JsonResponse
    {
        return $this->store($request, Office::TYPE_ZONE);
    }

    public function updateZone(Request $request, Office $zone): JsonResponse
    {
        return $this->update($request, $zone, Office::TYPE_ZONE);
    }

    public function toggleZone(Request $request, Office $zone): JsonResponse
    {
        return $this->toggle($request, $zone, Office::TYPE_ZONE);
    }

    public function destroyZone(Request $request, Office $zone): JsonResponse
    {
        return $this->destroy($request, $zone, Office::TYPE_ZONE);
    }

    protected function index(Request $request, string $type, int|string|null $parentId = null): JsonResponse
    {
        $this->authorize('viewAny', Office::class);

        $query = Office::query()
            ->where('type', $type)
            ->with('parent:id,name,code,type,parent_id')
            ->withCount(['children', 'users'])
            ->orderBy('name');

        $this->applyVisibleScope($query, $request->user());
        $this->applyStatus($query, $request->query('status', 'active'));

        if ($parentId !== null && $parentId !== '') {
            $query->where('parent_id', $parentId);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('all')) {
            $rows = $query->get()->map(fn (Office $office) => $this->payload($office))->values();

            return response()->json([
                'success' => true,
                'message' => Str::headline($type) . ' list retrieved successfully',
                'data' => $rows,
                'meta' => [
                    'current_page' => 1,
                    'per_page' => $rows->count(),
                    'total' => $rows->count(),
                    'last_page' => 1,
                ],
            ]);
        }

        $perPage = max(1, min((int) $request->query('per_page', 10), 100));
        $paginator = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => Str::headline($type) . ' list retrieved successfully',
            'data' => collect($paginator->items())->map(fn (Office $office) => $this->payload($office))->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    protected function store(Request $request, string $type): JsonResponse
    {
        $this->authorize('create', Office::class);
        $this->assertCanManageType($request->user(), $type);

        $data = $this->validatedPayload($request, $type);
        $this->validateParent($type, $data['parent_id'] ?? null);
        $this->assertParentVisible($request->user(), $data['parent_id'] ?? null);

        $office = Office::create([
            'name' => $data['name'],
            'code' => $this->resolveCode($data['code'] ?? null, $data['name'], $type, $data['parent_id'] ?? null),
            'type' => $type,
            'parent_id' => $type === Office::TYPE_CITY ? null : ($data['parent_id'] ?? null),
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => Str::headline($type) . ' created successfully',
            'data' => $this->payload($office->load('parent')->loadCount(['children', 'users'])),
        ], 201);
    }

    protected function show(Request $request, Office $office, string $type): JsonResponse
    {
        $this->assertType($office, $type);
        $this->authorize('view', $office);
        $this->assertOfficeVisible($request->user(), $office);

        return $this->ok(Str::headline($type) . ' retrieved successfully', $this->payload($office->load('parent', 'children')->loadCount(['children', 'users'])));
    }

    protected function update(Request $request, Office $office, string $type): JsonResponse
    {
        $this->assertType($office, $type);
        $this->authorize('update', $office);
        $this->assertOfficeVisible($request->user(), $office);
        $this->assertCanManageType($request->user(), $type);

        $data = $this->validatedPayload($request, $type, $office->id);
        $this->validateParent($type, $data['parent_id'] ?? null, $office);
        $this->assertParentVisible($request->user(), $data['parent_id'] ?? null);

        $office->update([
            'name' => $data['name'],
            'code' => $this->resolveCode($data['code'] ?? $office->code, $data['name'], $type, $data['parent_id'] ?? null, $office->id),
            'parent_id' => $type === Office::TYPE_CITY ? null : ($data['parent_id'] ?? null),
            'is_active' => $data['is_active'] ?? $office->is_active,
        ]);

        return $this->ok(Str::headline($type) . ' updated successfully', $this->payload($office->fresh(['parent'])->loadCount(['children', 'users'])));
    }

    protected function toggle(Request $request, Office $office, string $type): JsonResponse
    {
        $this->assertType($office, $type);
        $this->authorize('toggle', $office);
        $this->assertOfficeVisible($request->user(), $office);
        $this->assertCanManageType($request->user(), $type);

        $office->forceFill(['is_active' => ! $office->is_active])->save();

        return $this->ok(Str::headline($type) . ' status updated successfully', $this->payload($office->fresh(['parent'])->loadCount(['children', 'users'])));
    }

    protected function destroy(Request $request, Office $office, string $type): JsonResponse
    {
        $this->assertType($office, $type);
        $this->authorize('delete', $office);
        $this->assertOfficeVisible($request->user(), $office);
        $this->assertCanManageType($request->user(), $type);

        $dependencies = $this->dependencyCounts($office);
        if (array_sum($dependencies) > 0) {
            throw ValidationException::withMessages([
                'location' => ['Cannot delete this location while child locations, users, or citizens are attached. Deactivate it instead.'],
            ]);
        }

        $office->delete();

        return $this->ok(Str::headline($type) . ' deleted successfully', null);
    }

    protected function validatedPayload(Request $request, string $type, ?int $ignoreId = null): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:150'],
            'code' => [
                'nullable',
                'string',
                'max:80',
                Rule::unique('offices', 'code')->ignore($ignoreId),
            ],
            'parent_id' => [$type === Office::TYPE_CITY ? 'nullable' : 'required', 'nullable', 'integer', Rule::exists('offices', 'id')],
            'is_active' => ['nullable', 'boolean'],
        ];

        return $request->validate($rules);
    }

    protected function validateParent(string $type, int|string|null $parentId, ?Office $currentOffice = null): void
    {
        if ($type === Office::TYPE_CITY) {
            return;
        }

        if (! $parentId) {
            throw ValidationException::withMessages(['parent_id' => ['Parent location is required.']]);
        }

        if ($currentOffice && (int) $currentOffice->id === (int) $parentId) {
            throw ValidationException::withMessages(['parent_id' => ['A location cannot be its own parent.']]);
        }

        $parent = Office::findOrFail($parentId);
        $expected = $this->parentTypeFor($type);

        if ($parent->type !== $expected) {
            throw ValidationException::withMessages(['parent_id' => [Str::headline($type) . ' must belong to a ' . Str::headline($expected) . '.']]);
        }

        if ($currentOffice && $this->isDescendantOf($parent, $currentOffice)) {
            throw ValidationException::withMessages(['parent_id' => ['Cannot set a descendant location as parent.']]);
        }
    }

    protected function parentTypeFor(string $type): string
    {
        return match ($type) {
            Office::TYPE_SUBCITY => Office::TYPE_CITY,
            Office::TYPE_WOREDA => Office::TYPE_SUBCITY,
            Office::TYPE_ZONE => Office::TYPE_WOREDA,
            default => '',
        };
    }

    protected function assertType(Office $office, string $type): void
    {
        if ($office->type !== $type) {
            abort(404);
        }
    }

    protected function payload(Office $office): array
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

    protected function ok(string $message, mixed $data): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);
    }

    protected function applyStatus(Builder $query, mixed $status): void
    {
        if ($status === 'inactive') {
            $query->where('is_active', false);
        } elseif ($status !== 'all') {
            $query->where('is_active', true);
        }
    }

    protected function resolveCode(?string $code, string $name, string $type, int|string|null $parentId, ?int $ignoreId = null): string
    {
        $base = trim((string) $code);

        if ($base === '') {
            $prefix = $parentId ? (Office::find($parentId)?->code ?? strtoupper($type)) : strtoupper($type);
            $base = $prefix . '-' . strtoupper(Str::slug($name));
        }

        $base = strtoupper(Str::slug($base));
        $candidate = $base;
        $counter = 2;

        while (Office::query()
            ->where('code', $candidate)
            ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
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
                $citizens = (int) DB::table('citizens')->where($column, $office->id)->count();
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

    protected function assertParentVisible(User $user, int|string|null $parentId): void
    {
        if (! $parentId) {
            return;
        }

        $ids = $this->visibleOfficeIds($user);
        if ($ids !== null && ! in_array((int) $parentId, $ids, true)) {
            throw ValidationException::withMessages(['parent_id' => ['Selected parent location is outside your administrative scope.']]);
        }
    }

    protected function assertCanManageType(User $user, string $type): void
    {
        if (! in_array($type, $this->manageableTypes($user), true)) {
            throw ValidationException::withMessages(['type' => ['You cannot manage this location level.']]);
        }
    }

    protected function manageableTypes(User $user): array
    {
        if ($user->hasRole('Super Admin')) {
            return [Office::TYPE_CITY, Office::TYPE_SUBCITY, Office::TYPE_WOREDA, Office::TYPE_ZONE];
        }

        if (! $user->hasRole('Admin')) {
            return [];
        }

        return match ($user->admin_level) {
            User::LEVEL_CITY => [Office::TYPE_SUBCITY, Office::TYPE_WOREDA, Office::TYPE_ZONE],
            User::LEVEL_SUBCITY => [Office::TYPE_WOREDA, Office::TYPE_ZONE],
            User::LEVEL_WOREDA => [Office::TYPE_ZONE],
            default => [],
        };
    }

    protected function visibleOfficeIds(User $user): ?array
    {
        if ($user->hasRole('Super Admin')) {
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
}
