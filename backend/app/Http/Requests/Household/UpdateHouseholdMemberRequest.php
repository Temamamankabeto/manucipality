<?php

namespace App\Http\Requests\Household;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHouseholdMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'relationship' => ['required', Rule::in(['head', 'spouse', 'child', 'parent', 'sibling', 'dependent', 'other'])],
            'is_dependent' => ['nullable', 'boolean'],
            'joined_at' => ['nullable', 'date'],
            'left_at' => ['nullable', 'date', 'after_or_equal:joined_at'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
