<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:active,disabled'],
            'role' => ['nullable', Rule::in([User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN])],
            'admin_level' => ['nullable', Rule::in([User::LEVEL_CITY, User::LEVEL_SUBCITY, User::LEVEL_WOREDA, User::LEVEL_ZONE])],
            'office_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'sub_city_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'woreda_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'zone_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
