<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Handle profile image upload
     */
    private function handleImageUpload(Request $request, $email, $oldImagePath = null)
    {
        if (!$request->hasFile('profile_image')) {
            return null;
        }

        $file = $request->file('profile_image');
        $extension = $file->getClientOriginalExtension();

        // Create filename: email-timestamp.extension
        $emailPrefix = str_replace(['@', '.'], ['-', '-'], $email);
        $timestamp = time();
        $filename = $emailPrefix . '-' . $timestamp . '.' . $extension;

        // Delete old image if exists
        if ($oldImagePath) {
            $oldFilePath = public_path($oldImagePath);
            if (File::exists($oldFilePath)) {
                File::delete($oldFilePath);
            }
        }

        // Save new image to public/uploads
        $file->move(public_path('uploads'), $filename);

        return 'uploads/' . $filename;
    }

    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return $this->successResponse($users, 'Users retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'type' => 'required|in:admin,user,manager',
            'status' => 'required|boolean',
            'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // max 5MB
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $data = $request->all();
        $data['password'] = Hash::make($data['password']);

        // Handle image upload
        $imagePath = $this->handleImageUpload($request, $data['email']);
        if ($imagePath) {
            $data['profile_image'] = $imagePath;
        }

        $user = User::create($data);
        return $this->successResponse($user, 'User created successfully', 201);
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->notFoundResponse('User not found');
        }

        return $this->successResponse($user, 'User retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->notFoundResponse('User not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'type' => 'required|in:admin,user,manager',
            'status' => 'required|boolean',
            'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // max 5MB
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $data = $request->all();
        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle image upload - delete old image and upload new one
        $imagePath = $this->handleImageUpload($request, $data['email'], $user->profile_image);
        if ($imagePath) {
            $data['profile_image'] = $imagePath;
        }

        $user->update($data);
        return $this->successResponse($user, 'User updated successfully');
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->notFoundResponse('User not found');
        }

        // Delete profile image if exists
        if ($user->profile_image) {
            $imagePath = public_path($user->profile_image);
            if (File::exists($imagePath)) {
                File::delete($imagePath);
            }
        }

        $user->delete();
        return $this->successResponse(null, 'User deleted successfully');
    }
}
