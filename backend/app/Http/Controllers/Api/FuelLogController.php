<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\FuelLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FuelLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = FuelLog::with('asset');

        if ($request->has('asset_id') && $request->asset_id !== '') {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('fuel_type') && $request->fuel_type !== '') {
            $query->where('fuel_type', $request->fuel_type);
        }

        if ($request->has('date_from') && $request->date_from !== '') {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to !== '') {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $fuelLogs = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get();
        return $this->successResponse($fuelLogs, 'Fuel logs retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'date' => 'required|date',
            'quantity' => 'required|numeric|min:0.01',
            'fuel_type' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
            'vendor' => 'nullable|string|max:255',
            'meter_reading' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $fuelLog = FuelLog::create($request->all());
        return $this->successResponse($fuelLog->load('asset'), 'Fuel log created successfully', 201);
    }

    public function show($id)
    {
        $fuelLog = FuelLog::with('asset')->find($id);

        if (!$fuelLog) {
            return $this->notFoundResponse('Fuel log not found');
        }

        return $this->successResponse($fuelLog, 'Fuel log retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $fuelLog = FuelLog::find($id);

        if (!$fuelLog) {
            return $this->notFoundResponse('Fuel log not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'date' => 'required|date',
            'quantity' => 'required|numeric|min:0.01',
            'fuel_type' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
            'vendor' => 'nullable|string|max:255',
            'meter_reading' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $fuelLog->update($request->all());
        return $this->successResponse($fuelLog->load('asset'), 'Fuel log updated successfully');
    }

    public function destroy($id)
    {
        $fuelLog = FuelLog::find($id);

        if (!$fuelLog) {
            return $this->notFoundResponse('Fuel log not found');
        }

        $fuelLog->delete();
        return $this->successResponse(null, 'Fuel log deleted successfully');
    }
}
