<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\User;
use App\Models\Operator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->successResponse([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
            ], 'User registered successfully', 201);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Registration failed', null, 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            // First try to login as User
            $user = User::where('email', $validated['email'])->first();

            if ($user && Hash::check($validated['password'], $user->password)) {
                $token = $user->createToken('auth-token')->plainTextToken;

                return $this->successResponse([
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'profile_image' => $user->profile_image,
                        'about_me' => $user->about_me,
                        'type' => 'user',
                    ],
                    'token' => $token,
                ], 'Login successful');
            }

            // If not a user, try to login as Operator
            $operator = Operator::where('email', $validated['email'])->first();

            if (!$operator) {
                return $this->unauthorizedResponse('Invalid credentials');
            }

            // Verify operator password
            if (!$operator->password || !Hash::check($validated['password'], $operator->password)) {
                return $this->unauthorizedResponse('Invalid credentials');
            }

            // Check if operator is active
            if ($operator->status !== 'active') {
                return $this->unauthorizedResponse('Operator account is not active');
            }

            // Generate token for operator
            $token = $operator->createToken('operator-token')->plainTextToken;

            return $this->successResponse([
                'user' => [
                    'id' => $operator->id,
                    'name' => $operator->name,
                    'email' => $operator->email,
                    'employee_id' => $operator->employee_id,
                    'job_title' => $operator->job_title,
                    'department' => $operator->department,
                    'phone' => $operator->phone,
                    'type' => 'operator',
                ],
                'token' => $token,
            ], 'Login successful');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Login failed: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Operator login - specifically for operators only
     */
    public function operatorLogin(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            // Try to login as Operator
            $operator = Operator::where('email', $validated['email'])->first();

            if (!$operator) {
                return $this->unauthorizedResponse('Invalid credentials');
            }

            // Verify operator password
            if (!$operator->password || !Hash::check($validated['password'], $operator->password)) {
                return $this->unauthorizedResponse('Invalid credentials');
            }

            // Check if operator is active
            if ($operator->status !== 'active') {
                return $this->unauthorizedResponse('Operator account is not active');
            }

            // Generate token for operator
            $token = $operator->createToken('operator-token')->plainTextToken;

            return $this->successResponse([
                'user' => [
                    'id' => $operator->id,
                    'name' => $operator->name,
                    'email' => $operator->email,
                    'employee_id' => $operator->employee_id,
                    'job_title' => $operator->job_title,
                    'department' => $operator->department,
                    'phone' => $operator->phone,
                    'type' => 'operator',
                ],
                'token' => $token,
            ], 'Login successful');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Login failed: ' . $e->getMessage(), null, 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            return $this->successResponse(null, 'Logged out successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Logout failed', null, 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();
            return $this->successResponse([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image,
                'about_me' => $user->about_me,
            ], 'User retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve user', null, 500);
        }
    }
}

