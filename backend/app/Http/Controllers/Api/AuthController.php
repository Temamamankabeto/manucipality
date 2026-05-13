<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'confirmed', 'min:8'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'data' => null,
                'meta' => null,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        $user->assignRole(User::ROLE_ADMIN);

        $accessToken = $user->createToken('municipality-api-token')->plainTextToken;
        $refreshToken = Str::random(64);

        $user->forceFill([
            'refresh_token' => hash('sha256', $refreshToken),
            'refresh_token_expires_at' => now()->addDays(30),
            'last_login_at' => now(),
        ])->save();

        return response()->json($this->authPayload($user, $accessToken, $refreshToken), 201)
            ->cookie($this->refreshCookie($refreshToken));
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is disabled. Please contact the administrator.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        $accessToken = $user->createToken('municipality-api-token')->plainTextToken;
        $refreshToken = Str::random(64);

        $user->forceFill([
            'refresh_token' => hash('sha256', $refreshToken),
            'refresh_token_expires_at' => now()->addDays(30),
            'last_login_at' => now(),
        ])->save();

        return response()->json($this->authPayload($user, $accessToken, $refreshToken))
            ->cookie($this->refreshCookie($refreshToken));
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Authenticated user retrieved successfully',
            'data' => $this->userPayload($user),
            'meta' => null,
            'user' => $this->userPayload($user),
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user?->currentAccessToken()?->delete();
        $user?->forceFill([
            'refresh_token' => null,
            'refresh_token_expires_at' => null,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
            'data' => null,
            'meta' => null,
        ])->withoutCookie('refresh_token');
    }

    protected function authPayload(User $user, string $accessToken, string $refreshToken): array
    {
        return [
            'success' => true,
            'message' => 'Authenticated successfully',
            'data' => [
                'token' => $accessToken,
                'refresh_token' => $refreshToken,
                'user' => $this->userPayload($user),
                'roles' => $user->getRoleNames()->values()->all(),
                'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
            ],
            'meta' => null,
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $this->userPayload($user),
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
        ];
    }

    protected function userPayload(User $user): array
    {
        $user->loadMissing(['office', 'subCity', 'woreda', 'zone']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'status' => $user->is_active ? 'active' : 'disabled',
            'role' => $user->getRoleNames()->first(),
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
            'admin_level' => $user->admin_level,
            'office_id' => $user->office_id,
            'sub_city_id' => $user->sub_city_id,
            'woreda_id' => $user->woreda_id,
            'zone_id' => $user->zone_id,
            'office' => $user->office,
            'sub_city' => $user->subCity,
            'woreda' => $user->woreda,
            'zone' => $user->zone,
        ];
    }

    protected function refreshCookie(string $refreshToken)
    {
        return cookie(
            'refresh_token',
            $refreshToken,
            60 * 24 * 30,
            '/',
            null,
            app()->environment('production'),
            true
        )->withSameSite('Lax');
    }
}
