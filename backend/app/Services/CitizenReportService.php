<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class CitizenReportService
{
    public function metrics(array $filters, User $actor): array
    {
        $citizens = $this->citizenQuery($filters, $actor);
        $households = $this->householdQuery($filters, $actor);

        return [
            'total_households' => (clone $households)->count(),
            'total_registered_citizens' => (clone $citizens)->count(),
            'active_citizens' => (clone $citizens)->where('status', Citizen::STATUS_ACTIVE)->count(),
            'pending_verifications' => (clone $citizens)->whereIn('status', [Citizen::STATUS_SUBMITTED, Citizen::STATUS_UNDER_REVIEW])->count(),
            'escalated_cases' => (clone $citizens)->where('status', Citizen::STATUS_FLAGGED)->count(),
            'duplicate_alerts' => DB::table('citizen_duplicate_flags')->where('status', 'open')->count(),
            'suspended_citizens' => (clone $citizens)->where('status', Citizen::STATUS_SUSPENDED)->count(),
            'household_statistics' => [
                'average_members' => round((float) DB::table('household_members')->where('status', 'active')->count() / max((clone $households)->count(), 1), 2),
                'active_households' => (clone $households)->where('status', 'active')->count(),
            ],
        ];
    }

    public function genderDistribution(array $filters, User $actor): array
    {
        return $this->citizenQuery($filters, $actor)
            ->select('gender', DB::raw('COUNT(*) as total'))
            ->groupBy('gender')
            ->orderBy('gender')
            ->get()
            ->map(fn ($row) => ['gender' => $row->gender ?: 'unknown', 'total' => (int) $row->total])
            ->values()
            ->all();
    }

    public function ageDistribution(array $filters, User $actor): array
    {
        $rows = $this->citizenQuery($filters, $actor)
            ->select('date_of_birth')
            ->whereNotNull('date_of_birth')
            ->get();

        $buckets = [
            '0-17' => 0,
            '18-35' => 0,
            '36-60' => 0,
            '60+' => 0,
            'unknown' => 0,
        ];

        foreach ($rows as $row) {
            $age = $row->date_of_birth?->age;
            if ($age === null) $buckets['unknown']++;
            elseif ($age <= 17) $buckets['0-17']++;
            elseif ($age <= 35) $buckets['18-35']++;
            elseif ($age <= 60) $buckets['36-60']++;
            else $buckets['60+']++;
        }

        return collect($buckets)->map(fn ($total, $bucket) => ['bucket' => $bucket, 'total' => $total])->values()->all();
    }

    public function householdReport(array $filters, User $actor): array
    {
        $query = $this->householdQuery($filters, $actor)
            ->with(['city:id,name', 'subcity:id,name', 'woreda:id,name', 'zone:id,name'])
            ->withCount('members')
            ->latest();

        return $query->limit(500)->get()->map(fn (Household $household) => [
            'household_number' => $household->household_number,
            'status' => $household->status,
            'members_count' => $household->members_count,
            'city' => $household->city?->name,
            'subcity' => $household->subcity?->name,
            'woreda' => $household->woreda?->name,
            'zone' => $household->zone?->name,
            'created_at' => optional($household->created_at)->toDateString(),
        ])->values()->all();
    }

    public function registrationTrends(array $filters, User $actor): array
    {
        return $this->citizenQuery($filters, $actor)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as total'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => ['date' => $row->date, 'total' => (int) $row->total])
            ->values()
            ->all();
    }

    public function suspendedCitizens(array $filters, User $actor): array
    {
        return $this->citizenQuery($filters, $actor)
            ->with(['city:id,name', 'subcity:id,name', 'woreda:id,name', 'zone:id,name'])
            ->where('status', Citizen::STATUS_SUSPENDED)
            ->latest('suspended_at')
            ->limit(500)
            ->get()
            ->map(fn (Citizen $citizen) => [
                'id' => $citizen->id,
                'registration_number' => $citizen->registration_number,
                'citizen_uid' => $citizen->citizen_uid,
                'full_name' => $citizen->full_name,
                'phone' => $citizen->phone,
                'city' => $citizen->city?->name,
                'subcity' => $citizen->subcity?->name,
                'woreda' => $citizen->woreda?->name,
                'zone' => $citizen->zone?->name,
                'suspended_at' => optional($citizen->suspended_at)->toISOString(),
            ])->values()->all();
    }

    protected function citizenQuery(array $filters, User $actor): Builder
    {
        $query = Citizen::query();
        $this->applyCitizenScope($query, $actor);
        $this->applyCommonFilters($query, $filters);
        return $query;
    }

    protected function householdQuery(array $filters, User $actor): Builder
    {
        $query = Household::query();
        $this->applyHouseholdScope($query, $actor);
        $this->applyCommonFilters($query, $filters);
        return $query;
    }

    protected function applyCommonFilters(Builder $query, array $filters): void
    {
        foreach (['city_id', 'subcity_id', 'woreda_id', 'zone_id'] as $field) {
            if (filled($filters[$field] ?? null)) {
                $query->where($field, $filters[$field]);
            }
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }
    }

    protected function applyCitizenScope(Builder $query, User $actor): void
    {
        if ($actor->isSuperAdmin()) return;
        $column = $this->scopeColumn($actor);
        $column ? $query->where($column, $actor->office_id) : $query->whereRaw('1 = 0');
    }

    protected function applyHouseholdScope(Builder $query, User $actor): void
    {
        if ($actor->isSuperAdmin()) return;
        $column = $this->scopeColumn($actor);
        $column ? $query->where($column, $actor->office_id) : $query->whereRaw('1 = 0');
    }

    protected function scopeColumn(User $actor): ?string
    {
        if (! $actor->isAdmin() || ! $actor->office_id || ! $actor->admin_level) return null;

        return match ($actor->admin_level) {
            User::LEVEL_CITY => 'city_id',
            User::LEVEL_SUBCITY => 'subcity_id',
            User::LEVEL_WOREDA => 'woreda_id',
            User::LEVEL_ZONE => 'zone_id',
            default => null,
        };
    }
}
