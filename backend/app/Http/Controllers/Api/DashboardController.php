<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\AssetAssignment;
use App\Models\Operator;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Get operator dashboard data
     * Returns operator info and their assigned projects
     */
    public function operatorDashboard(Request $request)
    {
        try {
            // Get the authenticated user (could be user or operator)
            $user = $request->user();

            // Check if it's an operator
            $operator = Operator::where('email', $user->email)->first();

            if (!$operator) {
                return $this->errorResponse('Operator not found', null, 404);
            }

            // Get assigned projects with asset details
            $assignments = AssetAssignment::with(['project', 'asset'])
                ->where('operator_id', $operator->id)
                ->whereNull('assigned_to') // Active assignments (no end date)
                ->orWhere(function ($query) use ($operator) {
                    $query->where('operator_id', $operator->id)
                        ->where('assigned_to', '>=', now()); // Still active
                })
                ->get();

            // Format the response
            $assignedProjects = $assignments->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'project' => $assignment->project ? [
                        'id' => $assignment->project->id,
                        'name' => $assignment->project->name,
                        'client_name' => $assignment->project->client_name,
                        'start_date' => $assignment->project->start_date,
                        'end_date' => $assignment->project->end_date,
                        'status' => $assignment->project->status,
                        'location' => $assignment->project->location ? $assignment->project->location->name : null,
                    ] : null,
                    'asset' => $assignment->asset ? [
                        'id' => $assignment->asset->id,
                        'name' => $assignment->asset->name,
                        'asset_code' => $assignment->asset->asset_code,
                        'status' => $assignment->asset->status,
                    ] : null,
                    'assigned_from' => $assignment->assigned_from,
                    'assigned_to' => $assignment->assigned_to,
                    'usage_type' => $assignment->usage_type,
                ];
            });

            // Get all assignments history (not just active)
            $totalAssignments = AssetAssignment::where('operator_id', $operator->id)->count();
            $activeAssignments = AssetAssignment::where('operator_id', $operator->id)
                ->whereNull('assigned_to')
                ->orWhere(function ($query) use ($operator) {
                    $query->where('operator_id', $operator->id)
                        ->where('assigned_to', '>=', now());
                })
                ->count();

            return $this->successResponse([
                'operator' => [
                    'id' => $operator->id,
                    'name' => $operator->name,
                    'email' => $operator->email,
                    'employee_id' => $operator->employee_id,
                    'job_title' => $operator->job_title,
                    'department' => $operator->department,
                    'phone' => $operator->phone,
                    'license_number' => $operator->license_number,
                    'license_type' => $operator->license_type,
                    'status' => $operator->status,
                    'hire_date' => $operator->hire_date,
                ],
                'stats' => [
                    'total_assignments' => $totalAssignments,
                    'active_assignments' => $activeAssignments,
                ],
                'assigned_projects' => $assignedProjects,
            ], 'Dashboard data retrieved successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve dashboard data: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get user/admin dashboard data
     */
    public function userDashboard(Request $request)
    {
        try {
            $user = $request->user();

            return $this->successResponse([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type,
                    'profile_image' => $user->profile_image,
                ],
                'stats' => [
                    'total_operators' => \App\Models\Operator::count(),
                    'total_assets' => \App\Models\Asset::count(),
                    'total_projects' => \App\Models\Project::count(),
                    'active_assignments' => \App\Models\AssetAssignment::whereNull('assigned_to')->count(),
                ],
            ], 'Dashboard data retrieved successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve dashboard data: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Auto-detect and return appropriate dashboard based on user type
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Check if it's an operator
            $operator = Operator::where('email', $user->email)->first();

            if ($operator) {
                return $this->operatorDashboard($request);
            }

            return $this->userDashboard($request);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve dashboard data: ' . $e->getMessage(), null, 500);
        }
    }
}
