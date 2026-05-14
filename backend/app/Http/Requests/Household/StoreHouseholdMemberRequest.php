<?php

namespace App\Http\Requests\Household;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHouseholdMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'citizen_id' => ['required', 'integer', 'exists:citizens,id'],
            'relationship' => ['required', Rule::in(['head', 'spouse', 'child', 'parent', 'sibling', 'dependent', 'other'])],
            'is_dependent' => ['nullable', 'boolean'],
            'joined_at' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ];
    }
}
