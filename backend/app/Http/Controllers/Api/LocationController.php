<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $locations = Location::with(['assets', 'projects'])->orderBy('created_at', 'desc')->get();
        return $this->successResponse($locations, 'Locations retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:site,yard,warehouse',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $location = Location::create($request->all());
        return $this->successResponse($location, 'Location created successfully', 201);
    }

    public function show($id)
    {
        $location = Location::with(['assets', 'projects'])->find($id);

        if (!$location) {
            return $this->notFoundResponse('Location not found');
        }

        return $this->successResponse($location, 'Location retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $location = Location::find($id);

        if (!$location) {
            return $this->notFoundResponse('Location not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:site,yard,warehouse',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $location->update($request->all());
        return $this->successResponse($location, 'Location updated successfully');
    }

    public function destroy($id)
    {
        $location = Location::find($id);

        if (!$location) {
            return $this->notFoundResponse('Location not found');
        }

        $location->delete();
        return $this->successResponse(null, 'Location deleted successfully');
    }
}
