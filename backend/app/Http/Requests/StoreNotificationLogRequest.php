<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Override;

class StoreNotificationLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient'    => ['required', 'email'],
            'subject'      => ['required', 'string', 'max:255'],
            'body'         => ['required', 'string'],
            'content_type' => ['required', 'string', 'in:html,text'],
            'event_type'   => ['nullable', 'string', 'max:100'],
            'webhook_url'  => ['nullable', 'url', 'max:255'],
        ];
    }

    #[Override]
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'error' => [
                'code' => 'VALIDATION_FAILED',
                'message' => 'Os dados informados são inválidos',
                'details' => $validator->errors()
            ]
        ], 422));
    }
}
