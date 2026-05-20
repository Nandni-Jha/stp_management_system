<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VendorController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $vendors = Vendor::orderBy('created_at', 'desc')->get();
        return $this->successResponse($vendors, 'Vendors retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'contact_details' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $vendor = Vendor::create($request->all());
        return $this->successResponse($vendor, 'Vendor created successfully', 201);
    }

    public function show($id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return $this->notFoundResponse('Vendor not found');
        }

        return $this->successResponse($vendor, 'Vendor retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return $this->notFoundResponse('Vendor not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'contact_details' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $vendor->update($request->all());
        return $this->successResponse($vendor, 'Vendor updated successfully');
    }

    public function destroy($id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return $this->notFoundResponse('Vendor not found');
        }

        $vendor->delete();
        return $this->successResponse(null, 'Vendor deleted successfully');
    }
}
