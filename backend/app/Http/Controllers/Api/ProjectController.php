<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $projects = Project::with(['location', 'milestones'])->orderBy('created_at', 'desc')->get();
        return $this->successResponse($projects, 'Projects retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location_id' => 'nullable|exists:locations,id',
            'status' => 'required|string|in:active,completed,on_hold',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $project = Project::create($request->all());
        return $this->successResponse($project->load('location'), 'Project created successfully', 201);
    }

    public function show($id)
    {
        $project = Project::with(['location', 'assetAssignments.asset', 'assetAssignments.operator'])->find($id);

        if (!$project) {
            return $this->notFoundResponse('Project not found');
        }

        return $this->successResponse($project, 'Project retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return $this->notFoundResponse('Project not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location_id' => 'nullable|exists:locations,id',
            'status' => 'required|string|in:active,completed,on_hold',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $project->update($request->all());
        return $this->successResponse($project->load('location'), 'Project updated successfully');
    }

    public function destroy($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return $this->notFoundResponse('Project not found');
        }

        $project->delete();
        return $this->successResponse(null, 'Project deleted successfully');
    }
}
