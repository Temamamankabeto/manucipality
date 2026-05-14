<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\CitizenApproval;
use App\Models\CitizenDocument;
use App\Models\CitizenDuplicateFlag;
use App\Models\CitizenUniqueId;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CitizenWorkflowService
{
    protected array $requiredDocumentTypes = [
        CitizenDocument::TYPE_NATIONAL_ID,
        CitizenDocument::TYPE_BIRTH_CERTIFICATE,
    ];

    public function pending(array $filters, User $actor): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));
        $search = trim((string) ($filters['search'] ?? ''));

        $query = Citizen::query()
            ->with($this->relations())
            ->whereIn('status', $this->statusesForStage($filters['stage'] ?? null))
            ->latest();

        $this->applyOfficeScope($query, $actor);

        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('citizen_uid', 'like', "%{$search}%")
                    ->orWhere('national_id', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        foreach (['status', 'city_id', 'subcity_id', 'woreda_id', 'zone_id'] as $field) {
            if (filled($filters[$field] ?? null)) {
                $query->where($field, $filters[$field]);
            }
        }

        return $query->paginate($perPage);
    }

    public function duplicateFlags(array $filters, User $actor): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));

        $query = CitizenDuplicateFlag::query()
            ->with([
                'citizen.city:id,name,type,parent_id',
                'citizen.subcity:id,name,type,parent_id',
                'citizen.woreda:id,name,type,parent_id',
                'citizen.zone:id,name,type,parent_id',
                'matchedCitizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,national_id,phone,status',
                'flaggedBy:id,name,email',
            ])
            ->latest('flagged_at');

        if (! $actor->isSuperAdmin()) {
            $query->whereHas('citizen', fn (Builder $citizenQuery) => $this->applyOfficeScope($citizenQuery, $actor));
        }

        if (filled($filters['status'] ?? null)) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }

    public function workflow(Citizen $citizen, User $actor): array
    {
        $this->assertCanAccess($citizen, $actor);
        $citizen->load($this->relations());

        return $this->transform($citizen);
    }

    public function startReview(Citizen $citizen, User $actor, ?string $remarks = null): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.review');
        $this->assertStageLevel($actor, User::LEVEL_WOREDA);
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_SUBMITTED]);

        return DB::transaction(function () use ($citizen, $actor, $remarks) {
            return $this->transition($citizen, $actor, Citizen::STATUS_UNDER_REVIEW, 'document_verification', 'start_review', $remarks ?: 'Document review started.', [
                'reviewed_at' => now(),
                'current_workflow_stage' => 'document_verification',
            ]);
        });
    }

    public function verifyDocuments(Citizen $citizen, User $actor, array $documents = [], ?string $remarks = null): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.verify-documents');
        $this->assertStageLevel($actor, User::LEVEL_WOREDA);
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_UNDER_REVIEW]);

        DB::transaction(function () use ($citizen, $actor, $documents, $remarks) {
            if ($documents === []) {
                $documents = $citizen->documents()->get(['id'])->map(fn ($document) => [
                    'id' => $document->id,
                    'status' => CitizenDocument::VERIFICATION_VALID,
                    'remarks' => $remarks,
                ])->all();
            }

            foreach ($documents as $documentPayload) {
                $document = $citizen->documents()->whereKey($documentPayload['id'])->firstOrFail();
                $document->forceFill([
                    'verification_status' => $documentPayload['status'],
                    'verification_remarks' => $documentPayload['remarks'] ?? $remarks,
                    'verified_by' => $actor->id,
                    'verified_at' => $documentPayload['status'] === CitizenDocument::VERIFICATION_PENDING ? null : now(),
                ])->save();
            }

            $this->recordApproval($citizen, $actor, 'document_verification', 'verify_documents', $citizen->status, $citizen->status, $remarks ?: 'Documents verified.');
        });

        return $this->fresh($citizen);
    }

    public function woredaVerify(Citizen $citizen, User $actor, ?string $remarks = null): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.woreda-verify');
        $this->assertStageLevel($actor, User::LEVEL_WOREDA);
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_UNDER_REVIEW]);

        return DB::transaction(function () use ($citizen, $actor, $remarks) {
            $this->assertRequiredDocumentsValid($citizen);
            $duplicates = $this->findDuplicates($citizen);

            if ($duplicates->isNotEmpty()) {
                $this->createDuplicateFlags($citizen, $duplicates, $actor, 'Automatic duplicate detection before Woreda verification.');

                return $this->transition($citizen, $actor, Citizen::STATUS_FLAGGED, 'duplicate_investigation', 'flag_duplicate', $remarks ?: 'Possible duplicate detected. Escalated for investigation.', [
                    'flagged_at' => now(),
                    'flag_reason' => $remarks ?: 'Possible duplicate detected.',
                    'current_workflow_stage' => 'duplicate_investigation',
                ]);
            }

            return $this->transition($citizen, $actor, Citizen::STATUS_WOREDA_VERIFIED, 'woreda_validation', 'woreda_verify', $remarks ?: 'Woreda verification completed.', [
                'woreda_verified_at' => now(),
                'current_workflow_stage' => 'subcity_approval',
            ]);
        });
    }

    public function subcityApprove(Citizen $citizen, User $actor, ?string $remarks = null): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.subcity-approve');
        $this->assertStageLevel($actor, User::LEVEL_SUBCITY);
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_WOREDA_VERIFIED]);

        return $this->transition($citizen, $actor, Citizen::STATUS_SUBCITY_APPROVED, 'subcity_approval', 'subcity_approve', $remarks ?: 'Subcity final approval completed.', [
            'subcity_approved_at' => now(),
            'current_workflow_stage' => 'city_id_generation',
        ]);
    }

    public function generateId(Citizen $citizen, User $actor, ?string $remarks = null): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.generate-id');
        $this->assertStageLevel($actor, User::LEVEL_CITY);
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_SUBCITY_APPROVED]);

        return DB::transaction(function () use ($citizen, $actor, $remarks) {
            $uid = $citizen->citizen_uid ?: $this->nextCitizenUid();

            CitizenUniqueId::query()->updateOrCreate(
                ['citizen_id' => $citizen->id],
                ['citizen_uid' => $uid, 'generated_by' => $actor->id, 'generated_at' => now()]
            );

            return $this->transition($citizen, $actor, Citizen::STATUS_CITY_ID_GENERATED, 'city_id_generation', 'generate_city_id', $remarks ?: 'Unique citizen ID generated.', [
                'citizen_uid' => $uid,
                'city_id_generated_at' => now(),
                'current_workflow_stage' => 'activation',
            ]);
        });
    }

    public function activate(Citizen $citizen, User $actor, ?string $remarks = null): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.activate');
        $this->assertStageLevel($actor, User::LEVEL_CITY);
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_CITY_ID_GENERATED]);

        return $this->transition($citizen, $actor, Citizen::STATUS_ACTIVE, 'activation', 'activate_profile', $remarks ?: 'Citizen profile activated.', [
            'activated_at' => now(),
            'current_workflow_stage' => 'active',
        ]);
    }

    public function reject(Citizen $citizen, User $actor, string $reason): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.reject');
        $this->assertCanAccess($citizen, $actor);
        $this->assertStatus($citizen, [Citizen::STATUS_SUBMITTED, Citizen::STATUS_UNDER_REVIEW, Citizen::STATUS_WOREDA_VERIFIED, Citizen::STATUS_SUBCITY_APPROVED, Citizen::STATUS_FLAGGED]);

        return $this->transition($citizen, $actor, Citizen::STATUS_REJECTED, 'rejection', 'reject', $reason, [
            'rejected_at' => now(),
            'rejection_reason' => $reason,
            'current_workflow_stage' => 'rejected',
        ]);
    }

    public function flag(Citizen $citizen, User $actor, string $reason): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.flag');
        $this->assertCanAccess($citizen, $actor);

        return DB::transaction(function () use ($citizen, $actor, $reason) {
            $duplicates = $this->findDuplicates($citizen);
            $this->createDuplicateFlags($citizen, $duplicates, $actor, $reason);

            return $this->transition($citizen, $actor, Citizen::STATUS_FLAGGED, 'duplicate_investigation', 'flag', $reason, [
                'flagged_at' => now(),
                'flag_reason' => $reason,
                'current_workflow_stage' => 'duplicate_investigation',
            ]);
        });
    }

    public function suspend(Citizen $citizen, User $actor, string $reason): Citizen
    {
        $this->assertPermission($actor, 'citizens.workflow.suspend');
        if (! $actor->isSuperAdmin()) {
            throw ValidationException::withMessages(['role' => ['Only Super Admin can suspend citizens.']]);
        }
        $this->assertStatus($citizen, [Citizen::STATUS_ACTIVE, Citizen::STATUS_APPROVED, Citizen::STATUS_CITY_ID_GENERATED]);

        return $this->transition($citizen, $actor, Citizen::STATUS_SUSPENDED, 'suspension', 'suspend', $reason, [
            'suspended_at' => now(),
            'current_workflow_stage' => 'suspended',
        ]);
    }

    public function transformPaginated(LengthAwarePaginator $citizens): array
    {
        return [
            'success' => true,
            'message' => 'Citizen workflow queue retrieved successfully',
            'data' => collect($citizens->items())->map(fn (Citizen $citizen) => $this->summary($citizen))->values(),
            'meta' => [
                'current_page' => $citizens->currentPage(),
                'per_page' => $citizens->perPage(),
                'total' => $citizens->total(),
                'last_page' => $citizens->lastPage(),
            ],
        ];
    }

    public function transformDuplicateFlags(LengthAwarePaginator $flags): array
    {
        return [
            'success' => true,
            'message' => 'Duplicate flags retrieved successfully',
            'data' => collect($flags->items())->map(fn (CitizenDuplicateFlag $flag) => [
                'id' => $flag->id,
                'citizen_id' => $flag->citizen_id,
                'citizen' => $flag->citizen ? $this->summary($flag->citizen) : null,
                'matched_citizen_id' => $flag->matched_citizen_id,
                'matched_citizen' => $flag->matchedCitizen ? $this->summary($flag->matchedCitizen) : null,
                'national_id' => $flag->national_id,
                'phone' => $flag->phone,
                'status' => $flag->status,
                'severity' => $flag->severity,
                'remarks' => $flag->remarks,
                'flagged_by' => $flag->flaggedBy,
                'flagged_at' => optional($flag->flagged_at)->toISOString(),
            ])->values(),
            'meta' => [
                'current_page' => $flags->currentPage(),
                'per_page' => $flags->perPage(),
                'total' => $flags->total(),
                'last_page' => $flags->lastPage(),
            ],
        ];
    }

    protected function transition(Citizen $citizen, User $actor, string $toStatus, string $stage, string $action, ?string $remarks, array $extra = []): Citizen
    {
        $from = $citizen->status;
        $citizen->forceFill([
            'status' => $toStatus,
            'last_status_changed_by' => $actor->id,
            ...$extra,
        ])->save();

        $citizen->statusHistories()->create([
            'from_status' => $from,
            'to_status' => $toStatus,
            'reason' => $remarks,
            'changed_by' => $actor->id,
            'metadata' => ['stage' => $stage, 'action' => $action],
        ]);

        $this->recordApproval($citizen, $actor, $stage, $action, $from, $toStatus, $remarks);

        return $this->fresh($citizen);
    }

    protected function recordApproval(Citizen $citizen, User $actor, string $stage, string $action, ?string $fromStatus, ?string $toStatus, ?string $remarks, array $metadata = []): void
    {
        CitizenApproval::create([
            'citizen_id' => $citizen->id,
            'stage' => $stage,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'remarks' => $remarks,
            'decided_by' => $actor->id,
            'decided_at' => now(),
            'metadata' => $metadata ?: null,
        ]);
    }

    protected function fresh(Citizen $citizen): Citizen
    {
        return $citizen->fresh($this->relations());
    }

    protected function assertRequiredDocumentsValid(Citizen $citizen): void
    {
        $documents = $citizen->documents()->whereIn('type', $this->requiredDocumentTypes)->get();
        $existingTypes = $documents->pluck('type')->all();
        $missing = array_values(array_diff($this->requiredDocumentTypes, $existingTypes));

        if ($missing !== []) {
            throw ValidationException::withMessages(['documents' => ['Missing required documents: ' . implode(', ', $missing)]]);
        }

        $invalid = $documents->filter(fn (CitizenDocument $document) => $document->verification_status !== CitizenDocument::VERIFICATION_VALID);
        if ($invalid->isNotEmpty()) {
            throw ValidationException::withMessages(['documents' => ['All required documents must be verified as valid before Woreda verification.']]);
        }
    }

    protected function findDuplicates(Citizen $citizen)
    {
        return Citizen::query()
            ->whereKeyNot($citizen->id)
            ->where(function (Builder $q) use ($citizen) {
                if (filled($citizen->national_id)) {
                    $q->orWhere('national_id', $citizen->national_id);
                }
                if (filled($citizen->phone)) {
                    $q->orWhere('phone', $citizen->phone);
                }
            })
            ->limit(20)
            ->get();
    }

    protected function createDuplicateFlags(Citizen $citizen, $duplicates, User $actor, ?string $remarks): void
    {
        if ($duplicates->isEmpty()) {
            CitizenDuplicateFlag::firstOrCreate(
                ['citizen_id' => $citizen->id, 'matched_citizen_id' => null, 'status' => CitizenDuplicateFlag::STATUS_OPEN],
                [
                    'national_id' => $citizen->national_id,
                    'phone' => $citizen->phone,
                    'severity' => 'medium',
                    'remarks' => $remarks,
                    'flagged_by' => $actor->id,
                    'flagged_at' => now(),
                ]
            );

            return;
        }

        foreach ($duplicates as $duplicate) {
            CitizenDuplicateFlag::firstOrCreate(
                ['citizen_id' => $citizen->id, 'matched_citizen_id' => $duplicate->id, 'status' => CitizenDuplicateFlag::STATUS_OPEN],
                [
                    'national_id' => $citizen->national_id,
                    'phone' => $citizen->phone,
                    'severity' => 'high',
                    'remarks' => $remarks,
                    'flagged_by' => $actor->id,
                    'flagged_at' => now(),
                ]
            );
        }
    }

    protected function nextCitizenUid(): string
    {
        $prefix = 'ADA-' . now()->format('Y');
        $next = CitizenUniqueId::query()->where('citizen_uid', 'like', $prefix . '-%')->count() + 1;

        do {
            $uid = $prefix . '-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
            $next++;
        } while (CitizenUniqueId::query()->where('citizen_uid', $uid)->exists());

        return $uid;
    }

    protected function assertPermission(User $actor, string $permission): void
    {
        if (! $actor->can($permission)) {
            throw ValidationException::withMessages(['permission' => ['You do not have permission to perform this action.']]);
        }
    }

    protected function assertStageLevel(User $actor, string $level): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if (! $actor->isAdmin() || $actor->admin_level !== $level) {
            throw ValidationException::withMessages(['admin_level' => ["This action requires {$level} level admin access."]]);
        }
    }

    protected function assertStatus(Citizen $citizen, array $statuses): void
    {
        if (! in_array($citizen->status, $statuses, true)) {
            throw ValidationException::withMessages(['status' => ['This citizen is not in a valid workflow status for the requested action.']]);
        }
    }

    protected function assertCanAccess(Citizen $citizen, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        if (! $actor->isAdmin()) {
            throw ValidationException::withMessages(['scope' => ['You are not allowed to access this citizen record.']]);
        }

        $allowed = match ($actor->admin_level) {
            User::LEVEL_CITY => (int) $citizen->city_id === (int) $actor->office_id,
            User::LEVEL_SUBCITY => (int) $citizen->subcity_id === (int) $actor->office_id,
            User::LEVEL_WOREDA => (int) $citizen->woreda_id === (int) $actor->office_id,
            User::LEVEL_ZONE => (int) $citizen->zone_id === (int) $actor->office_id,
            default => false,
        };

        if (! $allowed) {
            throw ValidationException::withMessages(['scope' => ['Citizen is outside your administrative scope.']]);
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

    protected function statusesForStage(?string $stage): array
    {
        return match ($stage) {
            'document_verification' => [Citizen::STATUS_SUBMITTED, Citizen::STATUS_UNDER_REVIEW],
            'woreda_validation' => [Citizen::STATUS_UNDER_REVIEW],
            'subcity_approval' => [Citizen::STATUS_WOREDA_VERIFIED],
            'city_id_generation' => [Citizen::STATUS_SUBCITY_APPROVED],
            'activation' => [Citizen::STATUS_CITY_ID_GENERATED],
            'flagged' => [Citizen::STATUS_FLAGGED],
            default => [Citizen::STATUS_SUBMITTED, Citizen::STATUS_UNDER_REVIEW, Citizen::STATUS_WOREDA_VERIFIED, Citizen::STATUS_SUBCITY_APPROVED, Citizen::STATUS_CITY_ID_GENERATED, Citizen::STATUS_FLAGGED],
        };
    }

    protected function relations(): array
    {
        return [
            'city:id,name,type,parent_id',
            'subcity:id,name,type,parent_id',
            'woreda:id,name,type,parent_id',
            'zone:id,name,type,parent_id',
            'address',
            'documents.uploadedBy:id,name,email',
            'documents.verifiedBy:id,name,email',
            'approvals.decidedBy:id,name,email',
            'duplicateFlags.matchedCitizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,national_id,phone,status',
            'uniqueId.generatedBy:id,name,email',
            'registeredBy:id,name,email',
        ];
    }

    protected function summary(Citizen $citizen): array
    {
        return [
            'id' => $citizen->id,
            'registration_number' => $citizen->registration_number,
            'citizen_uid' => $citizen->citizen_uid,
            'national_id' => $citizen->national_id,
            'full_name' => $citizen->full_name,
            'first_name' => $citizen->first_name,
            'middle_name' => $citizen->middle_name,
            'last_name' => $citizen->last_name,
            'gender' => $citizen->gender,
            'phone' => $citizen->phone,
            'email' => $citizen->email,
            'status' => $citizen->status,
            'current_workflow_stage' => $citizen->current_workflow_stage,
            'registration_channel' => $citizen->registration_channel,
            'photo_url' => $citizen->photo_url,
            'city' => $citizen->city,
            'subcity' => $citizen->subcity,
            'woreda' => $citizen->woreda,
            'zone' => $citizen->zone,
            'submitted_at' => optional($citizen->submitted_at)->toISOString(),
            'created_at' => optional($citizen->created_at)->toISOString(),
        ];
    }

    protected function transform(Citizen $citizen): array
    {
        return $this->summary($citizen) + [
            'address' => $citizen->address,
            'documents' => $citizen->documents,
            'approvals' => $citizen->approvals,
            'duplicate_flags' => $citizen->duplicateFlags,
            'unique_id' => $citizen->uniqueId,
            'rejection_reason' => $citizen->rejection_reason,
            'flag_reason' => $citizen->flag_reason,
            'reviewed_at' => optional($citizen->reviewed_at)->toISOString(),
            'woreda_verified_at' => optional($citizen->woreda_verified_at)->toISOString(),
            'subcity_approved_at' => optional($citizen->subcity_approved_at)->toISOString(),
            'city_id_generated_at' => optional($citizen->city_id_generated_at)->toISOString(),
            'activated_at' => optional($citizen->activated_at)->toISOString(),
            'rejected_at' => optional($citizen->rejected_at)->toISOString(),
            'flagged_at' => optional($citizen->flagged_at)->toISOString(),
            'suspended_at' => optional($citizen->suspended_at)->toISOString(),
        ];
    }
}
