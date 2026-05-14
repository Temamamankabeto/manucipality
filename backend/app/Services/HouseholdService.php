<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class HouseholdService
{
    public function __construct(protected AppNotificationService $notificationService) {}

    public function paginate(array $filters, User $actor): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));
        $search = trim((string) ($filters['search'] ?? ''));

        $query = Household::query()
            ->with($this->relations())
            ->withCount('members')
            ->latest();

        $this->applyOfficeScope($query, $actor);

        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                    ->orWhere('house_number', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhereHas('headCitizen', fn (Builder $citizen) => $citizen
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        foreach (['status', 'city_id', 'subcity_id', 'woreda_id', 'zone_id'] as $field) {
            if (filled($filters[$field] ?? null)) {
                $query->where($field, $filters[$field]);
            }
        }

        return $query->paginate($perPage);
    }

    public function create(array $data, User $actor): Household
    {
        return DB::transaction(function () use ($data, $actor) {
            $head = Citizen::findOrFail($data['head_citizen_id']);
            $this->assertCitizenActive($head);
            $this->assertOfficeScopeAllowed($data, $actor);
            $this->validateAddressMatchesCitizen($data, $head);
            $this->assertCitizenNotActiveMember($head->id);

            $household = Household::create([
                'household_number' => $this->nextHouseholdNumber(),
                'head_citizen_id' => $head->id,
                'city_id' => $data['city_id'],
                'subcity_id' => $data['subcity_id'],
                'woreda_id' => $data['woreda_id'],
                'zone_id' => $data['zone_id'],
                'house_number' => $data['house_number'] ?? null,
                'address' => $data['address'] ?? null,
                'status' => $data['status'] ?? Household::STATUS_ACTIVE,
                'created_by' => $actor->id,
            ]);

            $household->members()->create([
                'citizen_id' => $head->id,
                'relationship' => HouseholdMember::RELATIONSHIP_HEAD,
                'is_head' => true,
                'is_dependent' => false,
                'joined_at' => now()->toDateString(),
                'status' => HouseholdMember::STATUS_ACTIVE,
                'added_by' => $actor->id,
            ]);

            $this->activity('household.created', $household, $actor, ['head_citizen_id' => $head->id]);
            $this->notificationService->create($actor, $head, 'household_created', 'Household created', "Household {$household->household_number} was created.");

            return $this->get($household->id, $actor);
        });
    }

    public function update(Household $household, array $data, User $actor): Household
    {
        $this->assertCanAccess($household, $actor);

        return DB::transaction(function () use ($household, $data, $actor) {
            $head = Citizen::findOrFail($data['head_citizen_id']);
            $this->assertCitizenActive($head);
            $this->assertOfficeScopeAllowed($data, $actor);
            $this->validateAddressMatchesCitizen($data, $head);

            $household->update([
                'head_citizen_id' => $head->id,
                'city_id' => $data['city_id'],
                'subcity_id' => $data['subcity_id'],
                'woreda_id' => $data['woreda_id'],
                'zone_id' => $data['zone_id'],
                'house_number' => $data['house_number'] ?? null,
                'address' => $data['address'] ?? null,
                'status' => $data['status'],
            ]);

            $household->members()->where('is_head', true)->update(['is_head' => false, 'relationship' => HouseholdMember::RELATIONSHIP_OTHER]);
            $member = $household->members()->firstOrCreate(
                ['citizen_id' => $head->id],
                ['joined_at' => now()->toDateString(), 'added_by' => $actor->id]
            );
            $member->forceFill([
                'relationship' => HouseholdMember::RELATIONSHIP_HEAD,
                'is_head' => true,
                'is_dependent' => false,
                'status' => HouseholdMember::STATUS_ACTIVE,
            ])->save();

            $this->activity('household.updated', $household, $actor, $data);

            return $this->get($household->id, $actor);
        });
    }

    public function get(int|string $id, User $actor): Household
    {
        $household = Household::with($this->relations())->withCount('members')->findOrFail($id);
        $this->assertCanAccess($household, $actor);
        return $household;
    }

    public function delete(Household $household, User $actor): void
    {
        $this->assertCanAccess($household, $actor);
        $this->activity('household.deleted', $household, $actor);
        $household->delete();
    }

    public function addMember(Household $household, array $data, User $actor): HouseholdMember
    {
        $this->assertCanAccess($household, $actor);
        $citizen = Citizen::findOrFail($data['citizen_id']);
        $this->assertCitizenActive($citizen);
        $this->assertCitizenBelongsToHouseholdScope($household, $citizen);
        $this->validateRelationship($household, $citizen, $data['relationship'], (bool) ($data['is_dependent'] ?? false));
        $this->assertCitizenNotActiveMember($citizen->id, $household->id);

        $member = $household->members()->create([
            'citizen_id' => $citizen->id,
            'relationship' => $data['relationship'],
            'is_head' => $data['relationship'] === HouseholdMember::RELATIONSHIP_HEAD,
            'is_dependent' => (bool) ($data['is_dependent'] ?? in_array($data['relationship'], [HouseholdMember::RELATIONSHIP_CHILD, HouseholdMember::RELATIONSHIP_DEPENDENT], true)),
            'joined_at' => $data['joined_at'] ?? now()->toDateString(),
            'status' => $data['status'] ?? HouseholdMember::STATUS_ACTIVE,
            'added_by' => $actor->id,
        ]);

        if ($member->is_head) {
            $household->members()->where('id', '!=', $member->id)->update(['is_head' => false]);
            $household->forceFill(['head_citizen_id' => $citizen->id])->save();
        }

        $this->activity('household.member_added', $household, $actor, ['citizen_id' => $citizen->id, 'relationship' => $member->relationship]);
        $this->notificationService->create($actor, $citizen, 'household_member_added', 'Household membership added', "{$citizen->full_name} was added to household {$household->household_number}.");

        return $member->load(['citizen', 'addedBy:id,name,email']);
    }

    public function updateMember(Household $household, HouseholdMember $member, array $data, User $actor): HouseholdMember
    {
        $this->assertCanAccess($household, $actor);
        $this->assertMemberBelongsToHousehold($household, $member);
        $member->loadMissing('citizen');
        $this->validateRelationship($household, $member->citizen, $data['relationship'], (bool) ($data['is_dependent'] ?? false), $member->id);

        $member->update([
            'relationship' => $data['relationship'],
            'is_head' => $data['relationship'] === HouseholdMember::RELATIONSHIP_HEAD,
            'is_dependent' => (bool) ($data['is_dependent'] ?? false),
            'joined_at' => $data['joined_at'] ?? $member->joined_at,
            'left_at' => $data['left_at'] ?? null,
            'status' => $data['status'],
        ]);

        if ($member->is_head) {
            $household->members()->where('id', '!=', $member->id)->update(['is_head' => false]);
            $household->forceFill(['head_citizen_id' => $member->citizen_id])->save();
        }

        $this->activity('household.member_updated', $household, $actor, ['member_id' => $member->id]);

        return $member->fresh(['citizen', 'addedBy:id,name,email']);
    }

    public function removeMember(Household $household, HouseholdMember $member, User $actor): void
    {
        $this->assertCanAccess($household, $actor);
        $this->assertMemberBelongsToHousehold($household, $member);

        if ($member->is_head) {
            throw ValidationException::withMessages(['member' => ['Household head cannot be removed. Assign another head first.']]);
        }

        $this->activity('household.member_removed', $household, $actor, ['member_id' => $member->id, 'citizen_id' => $member->citizen_id]);
        $member->delete();
    }

    public function transformPaginated(LengthAwarePaginator $households): array
    {
        return [
            'success' => true,
            'message' => 'Households retrieved successfully',
            'data' => collect($households->items())->map(fn (Household $household) => $this->transform($household))->values(),
            'meta' => [
                'current_page' => $households->currentPage(),
                'per_page' => $households->perPage(),
                'total' => $households->total(),
                'last_page' => $households->lastPage(),
            ],
        ];
    }

    public function transform(Household $household): array
    {
        $household->loadMissing($this->relations());

        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'head_citizen_id' => $household->head_citizen_id,
            'head_citizen' => $this->citizenSummary($household->headCitizen),
            'city_id' => $household->city_id,
            'subcity_id' => $household->subcity_id,
            'woreda_id' => $household->woreda_id,
            'zone_id' => $household->zone_id,
            'city' => $household->city,
            'subcity' => $household->subcity,
            'woreda' => $household->woreda,
            'zone' => $household->zone,
            'house_number' => $household->house_number,
            'address' => $household->address,
            'status' => $household->status,
            'members_count' => (int) ($household->members_count ?? $household->members->count()),
            'members' => $household->members->map(fn (HouseholdMember $member) => $this->memberPayload($member))->values(),
            'created_by' => $household->createdBy,
            'created_at' => optional($household->created_at)->toISOString(),
            'updated_at' => optional($household->updated_at)->toISOString(),
        ];
    }

    public function memberPayload(HouseholdMember $member): array
    {
        $member->loadMissing('citizen', 'addedBy:id,name,email');

        return [
            'id' => $member->id,
            'household_id' => $member->household_id,
            'citizen_id' => $member->citizen_id,
            'citizen' => $this->citizenSummary($member->citizen),
            'relationship' => $member->relationship,
            'is_head' => (bool) $member->is_head,
            'is_dependent' => (bool) $member->is_dependent,
            'joined_at' => optional($member->joined_at)->toDateString(),
            'left_at' => optional($member->left_at)->toDateString(),
            'status' => $member->status,
            'added_by' => $member->addedBy,
        ];
    }

    protected function validateRelationship(Household $household, Citizen $citizen, string $relationship, bool $isDependent, ?int $ignoreMemberId = null): void
    {
        if ($relationship === HouseholdMember::RELATIONSHIP_HEAD) {
            $existing = $household->members()
                ->where('is_head', true)
                ->when($ignoreMemberId, fn ($query) => $query->where('id', '!=', $ignoreMemberId))
                ->exists();

            if ($existing) {
                throw ValidationException::withMessages(['relationship' => ['A household can only have one active head.']]);
            }

            if ($this->citizenAge($citizen) < 18) {
                throw ValidationException::withMessages(['citizen_id' => ['Household head must be at least 18 years old.']]);
            }
        }

        if ($relationship === HouseholdMember::RELATIONSHIP_SPOUSE && $isDependent) {
            throw ValidationException::withMessages(['is_dependent' => ['Spouse cannot be marked as dependent.']]);
        }

        if (in_array($relationship, [HouseholdMember::RELATIONSHIP_CHILD, HouseholdMember::RELATIONSHIP_DEPENDENT], true)) {
            if ($this->citizenAge($citizen) >= 18 && $isDependent) {
                throw ValidationException::withMessages(['is_dependent' => ['Adult members cannot be marked as child/dependent without changing relationship to other.']]);
            }
        }
    }

    protected function assertCitizenActive(Citizen $citizen): void
    {
        if (! in_array($citizen->status, [Citizen::STATUS_ACTIVE, Citizen::STATUS_APPROVED], true)) {
            throw ValidationException::withMessages(['citizen_id' => ['Only active citizens can be added to a household.']]);
        }
    }

    protected function assertCitizenNotActiveMember(int $citizenId, ?int $currentHouseholdId = null): void
    {
        $exists = HouseholdMember::query()
            ->where('citizen_id', $citizenId)
            ->where('status', HouseholdMember::STATUS_ACTIVE)
            ->when($currentHouseholdId, fn ($query) => $query->where('household_id', '!=', $currentHouseholdId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['citizen_id' => ['Citizen already belongs to an active household.']]);
        }
    }

    protected function validateAddressMatchesCitizen(array $data, Citizen $citizen): void
    {
        foreach (['city_id', 'subcity_id', 'woreda_id', 'zone_id'] as $field) {
            if ((int) ($data[$field] ?? 0) !== (int) $citizen->{$field}) {
                throw ValidationException::withMessages([$field => ['Household location must match the head citizen location.']]);
            }
        }
    }

    protected function assertCitizenBelongsToHouseholdScope(Household $household, Citizen $citizen): void
    {
        foreach (['city_id', 'subcity_id', 'woreda_id', 'zone_id'] as $field) {
            if ((int) $household->{$field} !== (int) $citizen->{$field}) {
                throw ValidationException::withMessages(['citizen_id' => ['Member must belong to the same city/subcity/woreda/zone as the household.']]);
            }
        }
    }

    protected function assertMemberBelongsToHousehold(Household $household, HouseholdMember $member): void
    {
        if ((int) $member->household_id !== (int) $household->id) {
            throw ValidationException::withMessages(['member' => ['Member does not belong to this household.']]);
        }
    }

    protected function assertCanAccess(Household $household, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if (! $actor->isAdmin()) {
            throw ValidationException::withMessages(['scope' => ['You are not allowed to access this household.']]);
        }

        $allowed = match ($actor->admin_level) {
            User::LEVEL_CITY => (int) $household->city_id === (int) $actor->office_id,
            User::LEVEL_SUBCITY => (int) $household->subcity_id === (int) $actor->office_id,
            User::LEVEL_WOREDA => (int) $household->woreda_id === (int) $actor->office_id,
            User::LEVEL_ZONE => (int) $household->zone_id === (int) $actor->office_id,
            default => false,
        };

        if (! $allowed) {
            throw ValidationException::withMessages(['scope' => ['Household is outside your administrative scope.']]);
        }
    }

    protected function assertOfficeScopeAllowed(array $data, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        $field = match ($actor->admin_level) {
            User::LEVEL_CITY => 'city_id',
            User::LEVEL_SUBCITY => 'subcity_id',
            User::LEVEL_WOREDA => 'woreda_id',
            User::LEVEL_ZONE => 'zone_id',
            default => null,
        };

        if (! $field || (int) ($data[$field] ?? 0) !== (int) $actor->office_id) {
            throw ValidationException::withMessages(['scope' => ['Selected household location is outside your administrative scope.']]);
        }
    }

    protected function applyOfficeScope(Builder $query, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if (! $actor->isAdmin() || ! $actor->office_id || ! $actor->admin_level) {
            $query->whereRaw('1 = 0');
            return;
        }

        $column = match ($actor->admin_level) {
            User::LEVEL_CITY => 'city_id',
            User::LEVEL_SUBCITY => 'subcity_id',
            User::LEVEL_WOREDA => 'woreda_id',
            User::LEVEL_ZONE => 'zone_id',
            default => null,
        };

        $column ? $query->where($column, $actor->office_id) : $query->whereRaw('1 = 0');
    }

    protected function nextHouseholdNumber(): string
    {
        $prefix = 'HH-' . now()->format('Y');
        $next = Household::query()->where('household_number', 'like', $prefix . '-%')->count() + 1;

        do {
            $number = $prefix . '-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
            $next++;
        } while (Household::query()->where('household_number', $number)->exists());

        return $number;
    }

    protected function citizenAge(Citizen $citizen): int
    {
        return $citizen->date_of_birth ? $citizen->date_of_birth->age : 0;
    }

    protected function relations(): array
    {
        return [
            'headCitizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,gender,date_of_birth,phone,status,city_id,subcity_id,woreda_id,zone_id',
            'city:id,name,type,parent_id',
            'subcity:id,name,type,parent_id',
            'woreda:id,name,type,parent_id',
            'zone:id,name,type,parent_id',
            'members.citizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,gender,date_of_birth,phone,status,city_id,subcity_id,woreda_id,zone_id',
            'members.addedBy:id,name,email',
            'createdBy:id,name,email',
        ];
    }

    protected function citizenSummary(?Citizen $citizen): ?array
    {
        if (! $citizen) {
            return null;
        }

        return [
            'id' => $citizen->id,
            'registration_number' => $citizen->registration_number,
            'citizen_uid' => $citizen->citizen_uid,
            'full_name' => $citizen->full_name,
            'gender' => $citizen->gender,
            'date_of_birth' => optional($citizen->date_of_birth)->toDateString(),
            'age' => $citizen->date_of_birth?->age,
            'phone' => $citizen->phone,
            'status' => $citizen->status,
        ];
    }

    protected function activity(string $event, Household $household, User $actor, array $properties = []): void
    {
        if (function_exists('activity')) {
            activity()
                ->causedBy($actor)
                ->performedOn($household)
                ->withProperties($properties)
                ->event($event)
                ->log($event);
        }
    }
}
