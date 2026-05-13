<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:100', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'admin_level' => ['nullable', Rule::in([User::LEVEL_CITY, User::LEVEL_SUBCITY, User::LEVEL_WOREDA, User::LEVEL_ZONE])],
            'office_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'sub_city_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'woreda_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'zone_id' => ['nullable', 'integer', Rule::exists('offices', 'id')],
            'role' => [
                'required',
                'string',
                Rule::in([User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN]),
                Rule::exists('roles', 'name')->where(fn ($q) => $q->where('guard_name', 'sanctum')),
            ],
        ];
    }
}
