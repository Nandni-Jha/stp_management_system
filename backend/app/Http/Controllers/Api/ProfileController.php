<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
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

    /**
     * Update the authenticated user's profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'about_me' => 'nullable|string|max:1000',
            'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // max 5MB
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $data = $request->only(['name', 'email', 'about_me']);

        // Handle image upload - delete old image and upload new one
        $imagePath = $this->handleImageUpload($request, $data['email'], $user->profile_image);
        if ($imagePath) {
            $data['profile_image'] = $imagePath;
        }

        $user->update($data);

        return $this->successResponse($user, 'Profile updated successfully');
    }

    /**
     * Update the authenticated user's password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password is incorrect', null, 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return $this->successResponse(null, 'Password updated successfully');
    }
}
