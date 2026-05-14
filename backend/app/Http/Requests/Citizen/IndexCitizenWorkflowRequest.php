<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexCitizenWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'stage' => ['nullable', Rule::in(['document_verification', 'woreda_validation', 'subcity_approval', 'city_id_generation', 'activation', 'flagged'])],
            'status' => ['nullable', 'string', 'max:40'],
            'city_id' => ['nullable', 'integer'],
            'subcity_id' => ['nullable', 'integer'],
            'woreda_id' => ['nullable', 'integer'],
            'zone_id' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
