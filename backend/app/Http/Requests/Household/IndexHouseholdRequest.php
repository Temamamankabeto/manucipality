<?php

namespace App\Http\Requests\Household;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
            'city_id' => ['nullable', 'integer', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:offices,id'],
            'zone_id' => ['nullable', 'integer', 'exists:offices,id'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
