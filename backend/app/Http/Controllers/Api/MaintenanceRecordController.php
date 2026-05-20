<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\MaintenanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MaintenanceRecordController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MaintenanceRecord::with(['asset', 'maintenanceType']);

        if ($request->has('asset_id') && $request->asset_id !== '') {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('maintenance_type_id') && $request->maintenance_type_id !== '') {
            $query->where('maintenance_type_id', $request->maintenance_type_id);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $maintenanceRecords = $query->orderBy('service_date', 'desc')->orderBy('created_at', 'desc')->get();
        return $this->successResponse($maintenanceRecords, 'Maintenance records retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'maintenance_type_id' => 'required|exists:maintenance_types,id',
            'description' => 'required|string',
            'service_date' => 'required|date',
            'next_due_date' => 'nullable|date|after:service_date',
            'cost' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:scheduled,completed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $maintenanceRecord = MaintenanceRecord::create($request->all());
        return $this->successResponse($maintenanceRecord->load(['asset', 'maintenanceType']), 'Maintenance record created successfully', 201);
    }

    public function show($id)
    {
        $maintenanceRecord = MaintenanceRecord::with(['asset', 'maintenanceType'])->find($id);

        if (!$maintenanceRecord) {
            return $this->notFoundResponse('Maintenance record not found');
        }

        return $this->successResponse($maintenanceRecord, 'Maintenance record retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $maintenanceRecord = MaintenanceRecord::find($id);

        if (!$maintenanceRecord) {
            return $this->notFoundResponse('Maintenance record not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'maintenance_type_id' => 'required|exists:maintenance_types,id',
            'description' => 'required|string',
            'service_date' => 'required|date',
            'next_due_date' => 'nullable|date|after:service_date',
            'cost' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:scheduled,completed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $maintenanceRecord->update($request->all());
        return $this->successResponse($maintenanceRecord->load(['asset', 'maintenanceType']), 'Maintenance record updated successfully');
    }

    public function destroy($id)
    {
        $maintenanceRecord = MaintenanceRecord::find($id);

        if (!$maintenanceRecord) {
            return $this->notFoundResponse('Maintenance record not found');
        }

        $maintenanceRecord->delete();
        return $this->successResponse(null, 'Maintenance record deleted successfully');
    }
}
