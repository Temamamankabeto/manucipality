<?php

namespace App\Http\Requests\Office;

use App\Models\Office;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexOfficeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', Rule::in([
                Office::TYPE_CITY,
                Office::TYPE_SUBCITY,
                Office::TYPE_WOREDA,
                Office::TYPE_ZONE,
            ])],
            'parent_id' => ['nullable', 'integer', 'exists:offices,id'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'all'])],
            'all' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
