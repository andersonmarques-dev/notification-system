<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
        ];
    }
}
