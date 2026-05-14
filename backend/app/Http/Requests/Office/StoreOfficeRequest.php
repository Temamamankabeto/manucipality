<?php

namespace App\Http\Requests\Office;

use App\Models\Office;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOfficeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:80', 'unique:offices,code'],
            'type' => ['required', Rule::in([
                Office::TYPE_CITY,
                Office::TYPE_SUBCITY,
                Office::TYPE_WOREDA,
                Office::TYPE_ZONE,
            ])],
            'parent_id' => ['nullable', 'integer', 'exists:offices,id'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
