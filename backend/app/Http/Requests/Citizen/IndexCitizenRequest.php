<?php

namespace App\Http\Requests\Citizen;

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
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended'])],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'city_id' => ['nullable', 'integer', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:offices,id'],
            'zone_id' => ['nullable', 'integer', 'exists:offices,id'],
            'registration_channel' => ['nullable', Rule::in(['municipal_office', 'mobile_registration'])],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
