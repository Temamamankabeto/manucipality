<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'national_id' => ['required', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'nationality' => ['required', 'string', 'max:80'],
            'marital_status' => ['nullable', Rule::in(['single', 'married', 'divorced', 'widowed'])],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:120'],
            'occupation' => ['nullable', 'string', 'max:120'],
            'education_level' => ['nullable', 'string', 'max:120'],
            'disability_status' => ['nullable', 'boolean'],
            'emergency_contact' => ['nullable', 'string', 'max:120'],
            'registration_channel' => ['nullable', Rule::in(['municipal_office', 'mobile_registration'])],
            'address' => ['required', 'string', 'max:1000'],
            'house_number' => ['nullable', 'string', 'max:100'],
            'city_id' => ['nullable', 'integer', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:offices,id'],
            'zone_id' => ['nullable', 'integer', 'exists:offices,id'],
            'photo' => ['nullable', 'image', 'max:4096'],
        ];
    }
}
