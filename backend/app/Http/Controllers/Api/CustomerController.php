<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $customers = Customer::orderBy('created_at', 'desc')->get();
        return $this->successResponse($customers, 'Customers retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'age' => 'required|integer|min:1|max:120',
            'status' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $customer = Customer::create($request->all());
        return $this->successResponse($customer, 'Customer created successfully', 201);
    }

    public function show($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return $this->notFoundResponse('Customer not found');
        }

        return $this->successResponse($customer, 'Customer retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return $this->notFoundResponse('Customer not found');
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'age' => 'required|integer|min:1|max:120',
            'status' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $customer->update($request->all());
        return $this->successResponse($customer, 'Customer updated successfully');
    }

    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return $this->notFoundResponse('Customer not found');
        }

        $customer->delete();
        return $this->successResponse(null, 'Customer deleted successfully');
    }
}
