<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Asset::with(['assetType', 'category', 'currentLocation']);

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('asset_type_id') && $request->asset_type_id !== '') {
            $query->where('asset_type_id', $request->asset_type_id);
        }

        if ($request->has('category_id') && $request->category_id !== '') {
            $query->where('category_id', $request->category_id);
        }

        $assets = $query->orderBy('created_at', 'desc')->get();
        return $this->successResponse($assets, 'Assets retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_code' => 'required|string|unique:assets|max:255',
            'asset_type_id' => 'required|exists:asset_types,id',
            'category_id' => 'required|exists:asset_categories,id',
            'name' => 'required|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'serial_number' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:active,idle,under_maintenance,retired',
            'current_location_id' => 'nullable|exists:locations,id',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $asset = Asset::create($request->all());
        return $this->successResponse($asset->load(['assetType', 'category', 'currentLocation']), 'Asset created successfully', 201);
    }

    public function show($id)
    {
        $asset = Asset::with([
            'assetType',
            'category',
            'currentLocation',
            'assetAssignments.operator',
            'assetAssignments.project',
            'fuelLogs',
            'maintenanceRecords.maintenanceType',
            'assetDocuments'
        ])->find($id);

        if (!$asset) {
            return $this->notFoundResponse('Asset not found');
        }

        return $this->successResponse($asset, 'Asset retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return $this->notFoundResponse('Asset not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_type_id' => 'required|exists:asset_types,id',
            'category_id' => 'required|exists:asset_categories,id',
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:active,idle,under_maintenance,retired',
            'current_location_id' => 'nullable|exists:locations,id',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $asset->update($request->all());
        return $this->successResponse($asset->load(['assetType', 'category', 'currentLocation']), 'Asset updated successfully');
    }

    public function destroy($id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return $this->notFoundResponse('Asset not found');
        }

        $asset->delete();
        return $this->successResponse(null, 'Asset deleted successfully');
    }
}
