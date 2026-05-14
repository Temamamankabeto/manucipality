<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\HouseholdMember;
use App\Models\User;

class CitizenProfileService
{
    public function __construct(protected CitizenService $citizenService, protected HouseholdService $householdService) {}

    public function profile(Citizen $citizen, User $actor): array
    {
        $this->citizenService->assertCanAccess($citizen, $actor);

        $citizen->load([
            'city:id,name,type,parent_id',
            'subcity:id,name,type,parent_id',
            'woreda:id,name,type,parent_id',
            'zone:id,name,type,parent_id',
            'address',
            'documents.uploadedBy:id,name,email',
            'documents.verifiedBy:id,name,email',
            'statusHistories.changedBy:id,name,email',
            'approvals.decidedBy:id,name,email',
            'duplicateFlags.matchedCitizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,national_id,phone,status',
            'uniqueId.generatedBy:id,name,email',
            'registeredBy:id,name,email,phone',
        ]);

        $membership = HouseholdMember::query()
            ->with([
                'household.headCitizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,phone,status',
                'household.city:id,name,type,parent_id',
                'household.subcity:id,name,type,parent_id',
                'household.woreda:id,name,type,parent_id',
                'household.zone:id,name,type,parent_id',
                'household.members.citizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,gender,date_of_birth,phone,status',
            ])
            ->where('citizen_id', $citizen->id)
            ->where('status', HouseholdMember::STATUS_ACTIVE)
            ->first();

        $household = $membership?->household;

        return [
            'personal_information' => [
                'id' => $citizen->id,
                'registration_number' => $citizen->registration_number,
                'citizen_uid' => $citizen->citizen_uid,
                'national_id' => $citizen->national_id,
                'full_name' => $citizen->full_name,
                'first_name' => $citizen->first_name,
                'middle_name' => $citizen->middle_name,
                'last_name' => $citizen->last_name,
                'gender' => $citizen->gender,
                'date_of_birth' => optional($citizen->date_of_birth)->toDateString(),
                'age' => $citizen->date_of_birth?->age,
                'place_of_birth' => $citizen->place_of_birth,
                'nationality' => $citizen->nationality,
                'marital_status' => $citizen->marital_status,
                'phone' => $citizen->phone,
                'email' => $citizen->email,
                'occupation' => $citizen->occupation,
                'education_level' => $citizen->education_level,
                'disability_status' => (bool) $citizen->disability_status,
                'emergency_contact' => $citizen->emergency_contact,
                'photo_url' => $citizen->photo_url,
                'status' => $citizen->status,
            ],
            'family_information' => [
                'relationship' => $membership?->relationship,
                'is_head' => (bool) ($membership?->is_head),
                'is_dependent' => (bool) ($membership?->is_dependent),
                'members' => $household ? $household->members->map(fn (HouseholdMember $member) => $this->householdService->memberPayload($member))->values() : [],
            ],
            'household_information' => $household ? $this->householdService->transform($household) : null,
            'documents' => $citizen->documents,
            'property_ownership' => [
                'items' => [],
                'message' => 'Property ownership integration is reserved for the Property Management module.',
            ],
            'service_history' => [
                'items' => [],
                'message' => 'Municipal service history will be populated by future service modules.',
            ],
            'payment_history' => [
                'items' => [],
                'message' => 'Payment history will be populated after payment integration.',
            ],
            'employment_information' => [
                'occupation' => $citizen->occupation,
                'education_level' => $citizen->education_level,
            ],
            'audit' => [
                'status_histories' => $citizen->statusHistories,
                'approvals' => $citizen->approvals,
                'duplicate_flags' => $citizen->duplicateFlags,
                'registered_by' => $citizen->registeredBy,
            ],
        ];
    }
}
