<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\MilestoneEquipmentBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MilestoneEquipmentBudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MilestoneEquipmentBudget::with('vendor');

        if ($request->milestone_id) {
            $query->where('milestone_id', $request->milestone_id);
        }

        return $this->successResponse($query->orderBy('created_at', 'asc')->get(), 'Equipment budgets retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'milestone_id' => 'required|exists:milestones,id',
            'vendor_id'    => 'nullable|exists:vendors,id',
            'type'         => 'required|string|max:255',
            'days'         => 'required|numeric|min:0',
            'rate'         => 'required|numeric|min:0',
            'amount'       => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item = MilestoneEquipmentBudget::create($request->all());
        return $this->successResponse($item->load('vendor'), 'Equipment budget created successfully', 201);
    }

    public function show($id)
    {
        $item = MilestoneEquipmentBudget::with('vendor')->find($id);

        if (!$item) {
            return $this->notFoundResponse('Equipment budget not found');
        }

        return $this->successResponse($item, 'Equipment budget retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $item = MilestoneEquipmentBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Equipment budget not found');
        }

        $validator = Validator::make($request->all(), [
            'vendor_id' => 'nullable|exists:vendors,id',
            'type'      => 'sometimes|string|max:255',
            'days'      => 'sometimes|numeric|min:0',
            'rate'      => 'sometimes|numeric|min:0',
            'amount'    => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item->update($request->all());
        return $this->successResponse($item->load('vendor'), 'Equipment budget updated successfully');
    }

    public function destroy($id)
    {
        $item = MilestoneEquipmentBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Equipment budget not found');
        }

        $item->delete();
        return $this->successResponse(null, 'Equipment budget deleted successfully');
    }
}
