<?php

namespace App\Http\Requests\Household;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'head_citizen_id' => ['required', 'integer', 'exists:citizens,id'],
            'city_id' => ['nullable', 'integer', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:offices,id'],
            'zone_id' => ['nullable', 'integer', 'exists:offices,id'],
            'house_number' => ['nullable', 'string', 'max:80'],
            'address' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
        ];
    }
}
