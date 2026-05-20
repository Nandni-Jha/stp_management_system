<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Labor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LaborController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $labors = Labor::with('category')->orderBy('name', 'asc')->get();
        return $this->successResponse($labors, 'Labors retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:labor_categories,id',
            'name' => 'required|string|max:255|unique:labors,name',
            'rate' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $labor = Labor::create($request->all());
        return $this->successResponse($labor->load('category'), 'Labor created successfully', 201);
    }

    public function show($id)
    {
        $labor = Labor::with('category')->find($id);

        if (!$labor) {
            return $this->notFoundResponse('Labor not found');
        }

        return $this->successResponse($labor, 'Labor retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $labor = Labor::find($id);

        if (!$labor) {
            return $this->notFoundResponse('Labor not found');
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:labor_categories,id',
            'name' => 'sometimes|string|max:255|unique:labors,name,' . $id,
            'rate' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $labor->update($request->all());
        return $this->successResponse($labor->load('category'), 'Labor updated successfully');
    }

    public function destroy($id)
    {
        $labor = Labor::find($id);

        if (!$labor) {
            return $this->notFoundResponse('Labor not found');
        }

        $labor->delete();
        return $this->successResponse(null, 'Labor deleted successfully');
    }
}
