<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\MilestoneMaterialBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MilestoneMaterialBudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MilestoneMaterialBudget::with('vendor');

        if ($request->milestone_id) {
            $query->where('milestone_id', $request->milestone_id);
        }

        return $this->successResponse($query->orderBy('created_at', 'asc')->get(), 'Material budgets retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'milestone_id' => 'required|exists:milestones,id',
            'vendor_id'    => 'nullable|exists:vendors,id',
            'item'         => 'required|string|max:255',
            'amount'       => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item = MilestoneMaterialBudget::create($request->all());
        return $this->successResponse($item->load('vendor'), 'Material budget created successfully', 201);
    }

    public function show($id)
    {
        $item = MilestoneMaterialBudget::with('vendor')->find($id);

        if (!$item) {
            return $this->notFoundResponse('Material budget not found');
        }

        return $this->successResponse($item, 'Material budget retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $item = MilestoneMaterialBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Material budget not found');
        }

        $validator = Validator::make($request->all(), [
            'vendor_id' => 'nullable|exists:vendors,id',
            'item'      => 'sometimes|string|max:255',
            'amount'    => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $item->update($request->all());
        return $this->successResponse($item->load('vendor'), 'Material budget updated successfully');
    }

    public function destroy($id)
    {
        $item = MilestoneMaterialBudget::find($id);

        if (!$item) {
            return $this->notFoundResponse('Material budget not found');
        }

        $item->delete();
        return $this->successResponse(null, 'Material budget deleted successfully');
    }
}
