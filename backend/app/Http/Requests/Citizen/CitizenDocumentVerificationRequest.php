<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CitizenDocumentVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'documents' => ['nullable', 'array'],
            'documents.*.id' => ['required_with:documents', 'integer', 'exists:citizen_documents,id'],
            'documents.*.status' => ['required_with:documents', Rule::in(['pending', 'valid', 'invalid'])],
            'documents.*.remarks' => ['nullable', 'string', 'max:1000'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
