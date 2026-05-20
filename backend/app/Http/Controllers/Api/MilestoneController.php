<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Milestone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MilestoneController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $milestones = Milestone::with('project')->orderBy('target_date', 'asc')->get();
        return $this->successResponse($milestones, 'Milestones retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'target_date' => 'required|date',
            'actual_date' => 'required|date|after_or_equal:target_date',
            'status' => 'required|string|in:pending,in_progress,completed,delayed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $milestone = Milestone::create($request->all());
        return $this->successResponse($milestone->load('project'), 'Milestone created successfully', 201);
    }

    public function show($id)
    {
        $milestone = Milestone::with(['project'])->find($id);

        if (!$milestone) {
            return $this->notFoundResponse('Milestone not found');
        }

        return $this->successResponse($milestone, 'Milestone retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $milestone = Milestone::find($id);

        if (!$milestone) {
            return $this->notFoundResponse('Milestone not found');
        }

        $validator = Validator::make($request->all(), [
            'project_id' => 'sometimes|exists:projects,id',
            'name' => 'sometimes|string|max:255',
            'target_date' => 'sometimes|date',
            'actual_date' => 'sometimes|date|after_or_equal:target_date',
            'status' => 'sometimes|string|in:pending,in_progress,completed,delayed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $milestone->update($request->all());
        return $this->successResponse($milestone->load('project'), 'Milestone updated successfully');
    }

    public function destroy($id)
    {
        $milestone = Milestone::find($id);

        if (!$milestone) {
            return $this->notFoundResponse('Milestone not found');
        }

        $milestone->delete();
        return $this->successResponse(null, 'Milestone deleted successfully');
    }

    public function getByProject($projectId)
    {
        $milestones = Milestone::where('project_id', $projectId)
            ->orderBy('target_date', 'asc')
            ->get();

        return $this->successResponse($milestones, 'Milestones retrieved successfully');
    }
}
