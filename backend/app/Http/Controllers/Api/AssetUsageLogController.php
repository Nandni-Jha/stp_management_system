<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\AssetUsageLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetUsageLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = AssetUsageLog::with(['asset', 'operator']);

        if ($request->has('asset_id') && $request->asset_id !== '') {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('operator_id') && $request->operator_id !== '') {
            $query->where('operator_id', $request->operator_id);
        }

        $assetUsageLogs = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get();
        return $this->successResponse($assetUsageLogs, 'Asset usage logs retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'operator_id' => 'required|exists:operators,id',
            'date' => 'required|date',
            'start_meter' => 'required|numeric|min:0',
            'end_meter' => 'required|numeric|min:0|gte:start_meter',
            'total_usage' => 'required|numeric|min:0',
            'unit' => 'required|string|in:km,hours',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assetUsageLog = AssetUsageLog::create($request->all());
        return $this->successResponse($assetUsageLog->load(['asset', 'operator']), 'Asset usage log created successfully', 201);
    }

    public function show($id)
    {
        $assetUsageLog = AssetUsageLog::with(['asset', 'operator'])->find($id);

        if (!$assetUsageLog) {
            return $this->notFoundResponse('Asset usage log not found');
        }

        return $this->successResponse($assetUsageLog, 'Asset usage log retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $assetUsageLog = AssetUsageLog::find($id);

        if (!$assetUsageLog) {
            return $this->notFoundResponse('Asset usage log not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'operator_id' => 'required|exists:operators,id',
            'date' => 'required|date',
            'start_meter' => 'required|numeric|min:0',
            'end_meter' => 'required|numeric|min:0|gte:start_meter',
            'total_usage' => 'required|numeric|min:0',
            'unit' => 'required|string|in:km,hours',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assetUsageLog->update($request->all());
        return $this->successResponse($assetUsageLog->load(['asset', 'operator']), 'Asset usage log updated successfully');
    }

    public function destroy($id)
    {
        $assetUsageLog = AssetUsageLog::find($id);

        if (!$assetUsageLog) {
            return $this->notFoundResponse('Asset usage log not found');
        }

        $assetUsageLog->delete();
        return $this->successResponse(null, 'Asset usage log deleted successfully');
    }
}
