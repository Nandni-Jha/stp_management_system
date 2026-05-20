<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\AssetAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetAssignmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = AssetAssignment::with(['asset', 'operator', 'project', 'project.location']);

        // Filter by operator_id if provided
        if ($request->has('operator_id')) {
            $query->where('operator_id', $request->operator_id);
        }

        $assignments = $query->orderBy('created_at', 'desc')->get();
        return $this->successResponse($assignments, 'Asset assignments retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'operator_id' => 'required|exists:operators,id',
            'project_id' => 'required|exists:projects,id',
            'assigned_from' => 'required|date',
            'assigned_to' => 'nullable|date|after_or_equal:assigned_from',
            'usage_type' => 'required|string|in:full_day,hourly',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assignment = AssetAssignment::create($request->all());
        return $this->successResponse($assignment->load(['asset', 'operator', 'project']), 'Asset assignment created successfully', 201);
    }

    public function show($id)
    {
        $assignment = AssetAssignment::with(['asset', 'operator', 'project'])->find($id);

        if (!$assignment) {
            return $this->notFoundResponse('Asset assignment not found');
        }

        return $this->successResponse($assignment, 'Asset assignment retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $assignment = AssetAssignment::find($id);

        if (!$assignment) {
            return $this->notFoundResponse('Asset assignment not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'operator_id' => 'required|exists:operators,id',
            'project_id' => 'required|exists:projects,id',
            'assigned_from' => 'required|date',
            'assigned_to' => 'nullable|date|after_or_equal:assigned_from',
            'usage_type' => 'required|string|in:full_day,hourly',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $assignment->update($request->all());
        return $this->successResponse($assignment->load(['asset', 'operator', 'project']), 'Asset assignment updated successfully');
    }

    public function destroy($id)
    {
        $assignment = AssetAssignment::find($id);

        if (!$assignment) {
            return $this->notFoundResponse('Asset assignment not found');
        }

        $assignment->delete();
        return $this->successResponse(null, 'Asset assignment deleted successfully');
    }
}
