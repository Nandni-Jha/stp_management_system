<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\MilestoneLaborBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MilestoneLaborBudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MilestoneLaborBudget::with('category');

        if ($request->milestone_id) {
            $query->where('milestone_id', $request->milestone_id);
        }

        return $this->successResponse($query->orderBy('created_at', 'asc')->get(), 'Labor budgets retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'milestone_id' => 'required|exists:milestones,id',
            'category_id'  => 'required|exists:labor_categories,id',
            'type'         => 'required|in:per_hour,per_day',
            'worker'       => 'required|integer|min:1',
            'unit'         => 'required|numeric|min:0',
            'rate'         => 'required|numeric|min:0',
            'amount'       => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item = MilestoneLaborBudget::create($request->all());
        return $this->successResponse($item->load('category'), 'Labor budget created successfully', 201);
    }

    public function show($id)
    {
        $item = MilestoneLaborBudget::with('category')->find($id);

        if (!$item) {
            return $this->notFoundResponse('Labor budget not found');
        }

        return $this->successResponse($item, 'Labor budget retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $item = MilestoneLaborBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Labor budget not found');
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:labor_categories,id',
            'type'        => 'sometimes|in:per_hour,per_day',
            'worker'      => 'sometimes|integer|min:1',
            'unit'        => 'sometimes|numeric|min:0',
            'rate'        => 'sometimes|numeric|min:0',
            'amount'      => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item->update($request->all());
        return $this->successResponse($item->load('category'), 'Labor budget updated successfully');
    }

    public function destroy($id)
    {
        $item = MilestoneLaborBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Labor budget not found');
        }

        $item->delete();
        return $this->successResponse(null, 'Labor budget deleted successfully');
    }
}
