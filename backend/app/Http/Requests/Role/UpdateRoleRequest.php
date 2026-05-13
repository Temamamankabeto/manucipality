<?php

namespace App\Http\Requests\Role;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('id') ?? $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::in([User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN]),
                Rule::unique('roles', 'name')->ignore($roleId)->where(fn ($q) => $q->where('guard_name', 'sanctum')),
            ],
        ];
    }
}
