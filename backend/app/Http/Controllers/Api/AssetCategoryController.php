<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetCategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $assetCategories = AssetCategory::with('assetType')->orderBy('name', 'asc')->get();
        return $this->successResponse($assetCategories, 'Asset categories retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_type_id' => 'required|exists:asset_types,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assetCategory = AssetCategory::create($request->all());
        return $this->successResponse($assetCategory->load('assetType'), 'Asset category created successfully', 201);
    }

    public function show($id)
    {
        $assetCategory = AssetCategory::with('assetType')->find($id);

        if (!$assetCategory) {
            return $this->notFoundResponse('Asset category not found');
        }

        return $this->successResponse($assetCategory, 'Asset category retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $assetCategory = AssetCategory::find($id);

        if (!$assetCategory) {
            return $this->notFoundResponse('Asset category not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_type_id' => 'required|exists:asset_types,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assetCategory->update($request->all());
        return $this->successResponse($assetCategory->load('assetType'), 'Asset category updated successfully');
    }

    public function destroy($id)
    {
        $assetCategory = AssetCategory::find($id);

        if (!$assetCategory) {
            return $this->notFoundResponse('Asset category not found');
        }

        $assetCategory->delete();
        return $this->successResponse(null, 'Asset category deleted successfully');
    }
}
