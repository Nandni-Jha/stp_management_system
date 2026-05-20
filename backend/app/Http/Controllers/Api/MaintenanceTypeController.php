<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\MaintenanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MaintenanceTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $maintenanceTypes = MaintenanceType::orderBy('created_at', 'desc')->get();
        return $this->successResponse($maintenanceTypes, 'Maintenance types retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:maintenance_types',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $maintenanceType = MaintenanceType::create($request->all());
        return $this->successResponse($maintenanceType, 'Maintenance type created successfully', 201);
    }

    public function show($id)
    {
        $maintenanceType = MaintenanceType::find($id);

        if (!$maintenanceType) {
            return $this->notFoundResponse('Maintenance type not found');
        }

        return $this->successResponse($maintenanceType, 'Maintenance type retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $maintenanceType = MaintenanceType::find($id);

        if (!$maintenanceType) {
            return $this->notFoundResponse('Maintenance type not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:maintenance_types,name,' . $id,
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $maintenanceType->update($request->all());
        return $this->successResponse($maintenanceType, 'Maintenance type updated successfully');
    }

    public function destroy($id)
    {
        $maintenanceType = MaintenanceType::find($id);

        if (!$maintenanceType) {
            return $this->notFoundResponse('Maintenance type not found');
        }

        $maintenanceType->delete();
        return $this->successResponse(null, 'Maintenance type deleted successfully');
    }
}
