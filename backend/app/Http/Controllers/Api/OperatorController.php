<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Operator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class OperatorController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $operators = Operator::orderBy('created_at', 'desc')->get();
        return $this->successResponse($operators, 'Operators retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'license_number' => 'required|string|max:255',
            'license_type' => 'required|string|max:255',
            'license_issue_date' => 'required|date',
            'license_expiry' => 'required|date',
            'phone' => 'required|string|max:20',
            'status' => 'required|string|in:active,inactive',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Auto-generate employee_id in sequential order
        $latestOperator = Operator::orderBy('id', 'desc')->first();
        $nextId = $latestOperator ? intval(substr($latestOperator->employee_id, 3)) + 1 : 1;
        $employeeId = 'EMP' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        $operatorData = $request->all();
        $operatorData['employee_id'] = $employeeId;

        // Hash the password if provided
        if (!empty($operatorData['password'])) {
            $operatorData['password'] = Hash::make($operatorData['password']);
        }

        $operator = Operator::create($operatorData);
        return $this->successResponse($operator, 'Operator created successfully', 201);
    }

    public function show($id)
    {
        $operator = Operator::with(['assetAssignments.asset', 'assetAssignments.project', 'assetUsageLogs.asset'])->find($id);

        if (!$operator) {
            return $this->notFoundResponse('Operator not found');
        }

        return $this->successResponse($operator, 'Operator retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $operator = Operator::find($id);

        if (!$operator) {
            return $this->notFoundResponse('Operator not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'license_number' => 'required|string|max:255',
            'license_type' => 'required|string|max:255',
            'license_issue_date' => 'required|date',
            'license_expiry' => 'required|date',
            'phone' => 'required|string|max:20',
            'status' => 'required|string|in:active,inactive',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $updateData = $request->all();

        // Hash the password if provided and not already hashed
        if (!empty($updateData['password'])) {
            $updateData['password'] = Hash::make($updateData['password']);
        }

        $operator->update($updateData);
        return $this->successResponse($operator, 'Operator updated successfully');
    }

    public function destroy($id)
    {
        $operator = Operator::find($id);

        if (!$operator) {
            return $this->notFoundResponse('Operator not found');
        }

        $operator->delete();
        return $this->successResponse(null, 'Operator deleted successfully');
    }
}
