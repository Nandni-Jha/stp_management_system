<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VendorController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the vendors.
     */
    public function index()
    {
        try {
            $vendors = Vendor::orderBy('name')->get();
            return $this->success($vendors, 'Vendors retrieved successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to retrieve vendors', 500, ['message' => $e->getMessage()]);
        }
    }

    /**
     * Store a newly created vendor in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:vendors,name',
                'type' => 'nullable|string|max:100',
                'contact_details' => 'nullable|string|max:1000',
            ]);

            $vendor = Vendor::create($validated);
            return $this->success($vendor, 'Vendor created successfully', 201);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->error('Failed to create vendor', 500, ['message' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified vendor.
     */
    public function show(Vendor $vendor)
    {
        try {
            return $this->success($vendor, 'Vendor retrieved successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to retrieve vendor', 500, ['message' => $e->getMessage()]);
        }
    }

    /**
     * Update the specified vendor in storage.
     */
    public function update(Request $request, Vendor $vendor)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255|unique:vendors,name,' . $vendor->id,
                'type' => 'nullable|string|max:100',
                'contact_details' => 'nullable|string|max:1000',
            ]);

            $vendor->update($validated);
            return $this->success($vendor, 'Vendor updated successfully');
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->error('Failed to update vendor', 500, ['message' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified vendor from storage.
     */
    public function destroy(Vendor $vendor)
    {
        try {
            $vendor->delete();
            return $this->success(null, 'Vendor deleted successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to delete vendor', 500, ['message' => $e->getMessage()]);
        }
    }
}
