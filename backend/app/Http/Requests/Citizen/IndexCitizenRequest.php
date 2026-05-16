<?php

namespace App\Http\Requests\Citizen;

use App\Models\Citizen;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],

            'status' => [
                'nullable',
                Rule::in([
                    Citizen::STATUS_DRAFT,
                    Citizen::STATUS_SUBMITTED,
                    Citizen::STATUS_UNDER_REVIEW,
                    Citizen::STATUS_WOREDA_VERIFIED,
                    Citizen::STATUS_SUBCITY_APPROVED,
                    Citizen::STATUS_CITY_ID_GENERATED,
                    Citizen::STATUS_ACTIVE,
                    Citizen::STATUS_APPROVED,
                    Citizen::STATUS_REJECTED,
                    Citizen::STATUS_FLAGGED,
                    Citizen::STATUS_SUSPENDED,
                ]),
            ],

            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'registration_channel' => ['nullable', Rule::in(['municipal_office', 'mobile_registration'])],

            'city_id' => ['nullable', 'integer', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:offices,id'],
            'zone_id' => ['nullable', 'integer', 'exists:offices,id'],

            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],

            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}