<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\CitizenAddress;
use App\Models\CitizenDocument;
use App\Models\Office;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CitizenService
{
    protected array $requiredDocumentTypes = [
        CitizenDocument::TYPE_NATIONAL_ID,
        CitizenDocument::TYPE_BIRTH_CERTIFICATE,
    ];

    public function paginateCitizens(array $filters, User $actor): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));
        $search = trim((string) ($filters['search'] ?? ''));

        $query = Citizen::query()
            ->with(['city:id,name,type,parent_id', 'subcity:id,name,type,parent_id', 'woreda:id,name,type,parent_id', 'zone:id,name,type,parent_id', 'address', 'documents'])
            ->latest();

        $this->applyOfficeScope($query, $actor);

        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('national_id', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        foreach (['status', 'gender', 'registration_channel', 'city_id', 'subcity_id', 'woreda_id', 'zone_id'] as $field) {
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

        return $query->paginate($perPage);
    }

    public function createCitizen(array $data, User $actor, ?UploadedFile $photo = null): Citizen
    {
        $this->assertOfficePayloadAllowed($data, $actor);

        return DB::transaction(function () use ($data, $actor, $photo) {
            $payload = $this->citizenPayload($data);
            $payload['registration_number'] = $this->nextRegistrationNumber();
            $payload['status'] = Citizen::STATUS_DRAFT;
            $payload['registered_by'] = $actor->id;
            $payload['last_status_changed_by'] = $actor->id;

            if ($photo) {
                $payload['photo_path'] = $photo->store('citizens/photos', 'public');
            }

            $citizen = Citizen::create($payload);
            $this->syncCurrentAddress($citizen, $data);
            $this->recordStatus($citizen, null, Citizen::STATUS_DRAFT, $actor, 'Citizen draft created.');

            return $this->getCitizen($citizen->id, $actor);
        });
    }

    public function getCitizen(int|string $id, User $actor): Citizen
    {
        $citizen = Citizen::query()
            ->with([
                'city:id,name,type,parent_id',
                'subcity:id,name,type,parent_id',
                'woreda:id,name,type,parent_id',
                'zone:id,name,type,parent_id',
                'registeredBy:id,name,email,phone',
                'address',
                'documents.uploadedBy:id,name,email',
                'statusHistories.changedBy:id,name,email',
            ])
            ->findOrFail($id);

        $this->assertCanAccess($citizen, $actor);

        return $citizen;
    }

    public function updateCitizen(Citizen $citizen, array $data, User $actor, ?UploadedFile $photo = null): Citizen
    {
        $this->assertCanAccess($citizen, $actor);
        $this->assertOfficePayloadAllowed($data, $actor);

        return DB::transaction(function () use ($citizen, $data, $actor, $photo) {
            $payload = $this->citizenPayload($data);

            if ($photo) {
                $this->deletePublicFile($citizen->photo_path);
                $payload['photo_path'] = $photo->store('citizens/photos', 'public');
            }

            $citizen->update($payload);
            $this->syncCurrentAddress($citizen, $data);

            return $this->getCitizen($citizen->id, $actor);
        });
    }

    public function deleteCitizen(Citizen $citizen, User $actor): void
    {
        $this->assertCanAccess($citizen, $actor);
        $citizen->delete();
    }

    public function submitCitizen(Citizen $citizen, User $actor): Citizen
    {
        $this->assertCanAccess($citizen, $actor);

        if ($citizen->status !== Citizen::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'status' => ['Only draft registrations can be submitted.'],
            ]);
        }

        $missingDocuments = $this->missingRequiredDocuments($citizen);
        if ($missingDocuments !== []) {
            throw ValidationException::withMessages([
                'documents' => ['Missing required documents: ' . implode(', ', $missingDocuments)],
            ]);
        }

        $from = $citizen->status;
        $citizen->forceFill([
            'status' => Citizen::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'last_status_changed_by' => $actor->id,
        ])->save();

        $this->recordStatus($citizen, $from, Citizen::STATUS_SUBMITTED, $actor, 'Citizen submitted for verification.');

        return $this->getCitizen($citizen->id, $actor);
    }

    public function uploadPhoto(Citizen $citizen, UploadedFile $photo, User $actor): Citizen
    {
        $this->assertCanAccess($citizen, $actor);
        $this->deletePublicFile($citizen->photo_path);

        $citizen->forceFill([
            'photo_path' => $photo->store('citizens/photos', 'public'),
        ])->save();

        return $this->getCitizen($citizen->id, $actor);
    }

    public function removePhoto(Citizen $citizen, User $actor): Citizen
    {
        $this->assertCanAccess($citizen, $actor);
        $this->deletePublicFile($citizen->photo_path);
        $citizen->forceFill(['photo_path' => null])->save();

        return $this->getCitizen($citizen->id, $actor);
    }

    public function storeDocument(Citizen $citizen, array $data, UploadedFile $file, User $actor): CitizenDocument
    {
        $this->assertCanAccess($citizen, $actor);

        $type = $data['type'];
        $path = $file->store("citizens/{$citizen->id}/documents", 'public');

        return $citizen->documents()->create([
            'type' => $type,
            'title' => $data['title'] ?? $this->documentTitle($type),
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize() ?: 0,
            'is_required' => in_array($type, $this->requiredDocumentTypes, true),
            'uploaded_by' => $actor->id,
        ])->load('uploadedBy:id,name,email');
    }

    public function updateDocument(Citizen $citizen, CitizenDocument $document, array $data, ?UploadedFile $file, User $actor): CitizenDocument
    {
        $this->assertCanAccess($citizen, $actor);

        if ($document->citizen_id !== $citizen->id) {
            throw new AuthorizationException('Document does not belong to this citizen.');
        }

        $payload = Arr::only($data, ['type', 'title']);

        if (isset($payload['type'])) {
            $payload['is_required'] = in_array($payload['type'], $this->requiredDocumentTypes, true);
        }

        if ($file) {
            $this->deletePublicFile($document->file_path);
            $payload += [
                'file_path' => $file->store("citizens/{$citizen->id}/documents", 'public'),
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize() ?: 0,
                'uploaded_by' => $actor->id,
            ];
        }

        $document->update($payload);

        return $document->fresh('uploadedBy:id,name,email');
    }

    public function deleteDocument(Citizen $citizen, CitizenDocument $document, User $actor): void
    {
        $this->assertCanAccess($citizen, $actor);

        if ($document->citizen_id !== $citizen->id) {
            throw new AuthorizationException('Document does not belong to this citizen.');
        }

        $document->delete();
    }

    public function duplicateCheck(?string $nationalId = null, ?string $phone = null, ?int $excludeCitizenId = null): array
    {
        $query = Citizen::query()
            ->with(['zone:id,name', 'woreda:id,name', 'subcity:id,name'])
            ->when($excludeCitizenId, fn ($q) => $q->where('id', '!=', $excludeCitizenId));

        $query->where(function (Builder $q) use ($nationalId, $phone) {
            if (filled($nationalId)) {
                $q->orWhere('national_id', $nationalId);
            }
            if (filled($phone)) {
                $q->orWhere('phone', $phone);
            }
        });

        return $query->limit(20)->get()->map(fn (Citizen $citizen) => $this->summary($citizen))->values()->all();
    }

    public function transformPaginated(LengthAwarePaginator $citizens): array
    {
        return [
            'success' => true,
            'message' => 'Citizens retrieved successfully',
            'data' => collect($citizens->items())->map(fn (Citizen $citizen) => $this->summary($citizen))->values(),
            'meta' => [
                'current_page' => $citizens->currentPage(),
                'per_page' => $citizens->perPage(),
                'total' => $citizens->total(),
                'last_page' => $citizens->lastPage(),
            ],
        ];
    }

    public function transform(Citizen $citizen): array
    {
        return [
            'id' => $citizen->id,
            'registration_number' => $citizen->registration_number,
            'national_id' => $citizen->national_id,
            'first_name' => $citizen->first_name,
            'middle_name' => $citizen->middle_name,
            'last_name' => $citizen->last_name,
            'full_name' => $citizen->full_name,
            'gender' => $citizen->gender,
            'date_of_birth' => optional($citizen->date_of_birth)->toDateString(),
            'place_of_birth' => $citizen->place_of_birth,
            'nationality' => $citizen->nationality,
            'marital_status' => $citizen->marital_status,
            'phone' => $citizen->phone,
            'email' => $citizen->email,
            'occupation' => $citizen->occupation,
            'education_level' => $citizen->education_level,
            'disability_status' => $citizen->disability_status,
            'emergency_contact' => $citizen->emergency_contact,
            'photo_url' => $citizen->photo_url,
            'registration_channel' => $citizen->registration_channel,
            'status' => $citizen->status,
            'city_id' => $citizen->city_id,
            'subcity_id' => $citizen->subcity_id,
            'woreda_id' => $citizen->woreda_id,
            'zone_id' => $citizen->zone_id,
            'city' => $citizen->city,
            'subcity' => $citizen->subcity,
            'woreda' => $citizen->woreda,
            'zone' => $citizen->zone,
            'address' => $citizen->address,
            'documents' => $citizen->documents,
            'missing_required_documents' => $this->missingRequiredDocuments($citizen),
            'status_histories' => $citizen->statusHistories,
            'registered_by' => $citizen->registeredBy,
            'submitted_at' => optional($citizen->submitted_at)->toISOString(),
            'created_at' => optional($citizen->created_at)->toISOString(),
            'updated_at' => optional($citizen->updated_at)->toISOString(),
        ];
    }

    public function assertCanAccess(Citizen $citizen, User $actor): void
    {
        if (! $this->canAccess($citizen, $actor)) {
            throw new AuthorizationException('You are not allowed to access this citizen record.');
        }
    }

    protected function canAccess(Citizen $citizen, User $actor): bool
    {
        if ($actor->hasRole('Super Admin')) {
            return true;
        }

        if (! $actor->hasRole('Admin') || ! $actor->office_id || ! $actor->admin_level) {
            return false;
        }

        return match ($actor->admin_level) {
            'city' => (int) $citizen->city_id === (int) $actor->office_id,
            'subcity' => (int) $citizen->subcity_id === (int) $actor->office_id,
            'woreda' => (int) $citizen->woreda_id === (int) $actor->office_id,
            'zone' => (int) $citizen->zone_id === (int) $actor->office_id,
            default => false,
        };
    }

    protected function applyOfficeScope(Builder $query, User $actor): void
    {
        if ($actor->hasRole('Super Admin')) {
            return;
        }

        if (! $actor->hasRole('Admin') || ! $actor->office_id || ! $actor->admin_level) {
            $query->whereRaw('1 = 0');
            return;
        }

        $column = match ($actor->admin_level) {
            'city' => 'city_id',
            'subcity' => 'subcity_id',
            'woreda' => 'woreda_id',
            'zone' => 'zone_id',
            default => null,
        };

        $column ? $query->where($column, $actor->office_id) : $query->whereRaw('1 = 0');
    }

    protected function assertOfficePayloadAllowed(array $data, User $actor): void
    {
        if ($actor->hasRole('Super Admin')) {
            return;
        }

        $key = match ($actor->admin_level) {
            'city' => 'city_id',
            'subcity' => 'subcity_id',
            'woreda' => 'woreda_id',
            'zone' => 'zone_id',
            default => null,
        };

        if (! $key || ! $actor->office_id || (int) ($data[$key] ?? 0) !== (int) $actor->office_id) {
            throw new AuthorizationException('You cannot register citizens outside your assigned administrative level.');
        }
    }

    protected function citizenPayload(array $data): array
    {
        return Arr::only($data, [
            'national_id',
            'first_name',
            'middle_name',
            'last_name',
            'gender',
            'date_of_birth',
            'place_of_birth',
            'nationality',
            'marital_status',
            'phone',
            'email',
            'occupation',
            'education_level',
            'disability_status',
            'emergency_contact',
            'registration_channel',
            'city_id',
            'subcity_id',
            'woreda_id',
            'zone_id',
        ]);
    }

    protected function syncCurrentAddress(Citizen $citizen, array $data): CitizenAddress
    {
        $citizen->addresses()->where('is_current', true)->update(['is_current' => false]);

        return $citizen->addresses()->create([
            'address' => $data['address'],
            'house_number' => $data['house_number'] ?? null,
            'city_id' => $data['city_id'],
            'subcity_id' => $data['subcity_id'],
            'woreda_id' => $data['woreda_id'],
            'zone_id' => $data['zone_id'],
            'is_current' => true,
        ]);
    }

    protected function recordStatus(Citizen $citizen, ?string $from, string $to, User $actor, ?string $reason = null, array $metadata = []): void
    {
        $citizen->statusHistories()->create([
            'from_status' => $from,
            'to_status' => $to,
            'reason' => $reason,
            'changed_by' => $actor->id,
            'metadata' => $metadata ?: null,
        ]);
    }

    protected function missingRequiredDocuments(Citizen $citizen): array
    {
        $existing = $citizen->documents()
            ->whereIn('type', $this->requiredDocumentTypes)
            ->pluck('type')
            ->all();

        return array_values(array_diff($this->requiredDocumentTypes, $existing));
    }

    protected function nextRegistrationNumber(): string
    {
        $prefix = 'CIT-' . now()->format('Y');
        $next = (Citizen::query()->where('registration_number', 'like', $prefix . '-%')->count() + 1);

        return $prefix . '-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }

    protected function documentTitle(string $type): string
    {
        return match ($type) {
            CitizenDocument::TYPE_NATIONAL_ID => 'National ID',
            CitizenDocument::TYPE_BIRTH_CERTIFICATE => 'Birth Certificate',
            CitizenDocument::TYPE_KEBELE_LETTER => 'Kebele Letter',
            CitizenDocument::TYPE_PASSPORT_PHOTO => 'Passport Photo',
            default => 'Supporting Document',
        };
    }

    protected function deletePublicFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    protected function summary(Citizen $citizen): array
    {
        return [
            'id' => $citizen->id,
            'registration_number' => $citizen->registration_number,
            'national_id' => $citizen->national_id,
            'full_name' => $citizen->full_name,
            'first_name' => $citizen->first_name,
            'middle_name' => $citizen->middle_name,
            'last_name' => $citizen->last_name,
            'gender' => $citizen->gender,
            'phone' => $citizen->phone,
            'email' => $citizen->email,
            'status' => $citizen->status,
            'registration_channel' => $citizen->registration_channel,
            'photo_url' => $citizen->photo_url,
            'city' => $citizen->city,
            'subcity' => $citizen->subcity,
            'woreda' => $citizen->woreda,
            'zone' => $citizen->zone,
            'created_at' => optional($citizen->created_at)->toISOString(),
        ];
    }
}
