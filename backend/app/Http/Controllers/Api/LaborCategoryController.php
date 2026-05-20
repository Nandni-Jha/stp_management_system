<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\LaborCategory;
use Illuminate\Http\Request;

class LaborCategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $categories = LaborCategory::orderBy('name', 'asc')->get();
        return $this->successResponse($categories, 'Labor categories retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255|unique:labor_categories,name',
            'hour_rate' => 'required|numeric|min:0',
            'day_rate'  => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $category = LaborCategory::create($request->all());
        return $this->successResponse($category, 'Labor category created successfully', 201);
    }

    public function show($id)
    {
        $category = LaborCategory::find($id);

        if (!$category) {
            return $this->notFoundResponse('Labor category not found');
        }

        return $this->successResponse($category, 'Labor category retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $category = LaborCategory::find($id);

        if (!$category) {
            return $this->notFoundResponse('Labor category not found');
        }

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:255|unique:labor_categories,name,' . $id,
            'hour_rate' => 'sometimes|numeric|min:0',
            'day_rate'  => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $category->update($request->all());
        return $this->successResponse($category, 'Labor category updated successfully');
    }

    public function destroy($id)
    {
        $category = LaborCategory::find($id);

        if (!$category) {
            return $this->notFoundResponse('Labor category not found');
        }

        $category->delete();
        return $this->successResponse(null, 'Labor category deleted successfully');
    }
}
