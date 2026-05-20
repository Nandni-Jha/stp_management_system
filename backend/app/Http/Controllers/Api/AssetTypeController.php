<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\AssetType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $assetTypes = AssetType::orderBy('name', 'asc')->get();
        return $this->successResponse($assetTypes, 'Asset types retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:asset_types',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assetType = AssetType::create($request->all());
        return $this->successResponse($assetType, 'Asset type created successfully', 201);
    }

    public function show($id)
    {
        $assetType = AssetType::find($id);

        if (!$assetType) {
            return $this->notFoundResponse('Asset type not found');
        }

        return $this->successResponse($assetType, 'Asset type retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $assetType = AssetType::find($id);

        if (!$assetType) {
            return $this->notFoundResponse('Asset type not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:asset_types,name,' . $id,
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assetType->update($request->all());
        return $this->successResponse($assetType, 'Asset type updated successfully');
    }

    public function destroy($id)
    {
        $assetType = AssetType::find($id);

        if (!$assetType) {
            return $this->notFoundResponse('Asset type not found');
        }

        $assetType->delete();
        return $this->successResponse(null, 'Asset type deleted successfully');
    }
}
