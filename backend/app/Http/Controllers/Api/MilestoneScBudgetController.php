<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\MilestoneScBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MilestoneScBudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MilestoneScBudget::query();

        if ($request->milestone_id) {
            $query->where('milestone_id', $request->milestone_id);
        }

        return $this->successResponse($query->orderBy('created_at', 'asc')->get(), 'Sub contractor budgets retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'milestone_id' => 'required|exists:milestones,id',
            'name'         => 'required|string|max:255',
            'milestone'    => 'nullable|string|max:255',
            'from'         => 'nullable|date',
            'to'           => 'nullable|date|after_or_equal:from',
            'amount'       => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item = MilestoneScBudget::create($request->all());
        return $this->successResponse($item, 'Sub contractor budget created successfully', 201);
    }

    public function show($id)
    {
        $item = MilestoneScBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Sub contractor budget not found');
        }

        return $this->successResponse($item, 'Sub contractor budget retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $item = MilestoneScBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Sub contractor budget not found');
        }

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:255',
            'milestone' => 'nullable|string|max:255',
            'from'      => 'nullable|date',
            'to'        => 'nullable|date|after_or_equal:from',
            'amount'    => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item->update($request->all());
        return $this->successResponse($item, 'Sub contractor budget updated successfully');
    }

    public function destroy($id)
    {
        $item = MilestoneScBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Sub contractor budget not found');
        }

        $item->delete();
        return $this->successResponse(null, 'Sub contractor budget deleted successfully');
    }
}
