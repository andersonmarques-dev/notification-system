<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            $user = Auth::user();
            $user->load('tenant');
            return response()->json([
                'message' => 'Login realizado com sucesso',
                'user' => $user
            ]);
        }

        return response()->json([
            'message' => 'As credenciais fornecidas estão incorretas.'
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('tenant'));
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'tenant_name' => ['required', 'string', 'max:255'],
            'user_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        try {
            $data = DB::transaction(function () use ($validated) {
                $tenant = Tenant::create([
                    'name' => $validated['tenant_name'],
                ]);

                $user = User::create([
                    'tenant_id' => $tenant->id,
                    'name' => $validated['user_name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                ]);

                return ['user' => $user, 'tenant' => $tenant];
            });

            Auth::login($data['user']);
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Conta e infraestrutura provisionadas com sucesso.',
                'user' => $data['user']->load('tenant')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Falha no provisionamento da conta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
