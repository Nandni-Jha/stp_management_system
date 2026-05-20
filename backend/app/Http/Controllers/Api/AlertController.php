<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AlertController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Alert::with('asset');

        if ($request->has('asset_id') && $request->asset_id !== '') {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('alert_type') && $request->alert_type !== '') {
            $query->where('alert_type', $request->alert_type);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $alerts = $query->orderBy('trigger_date', 'desc')->orderBy('created_at', 'desc')->get();
        return $this->successResponse($alerts, 'Alerts retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'alert_type' => 'required|string|max:255',
            'message' => 'required|string',
            'trigger_date' => 'required|date',
            'status' => 'required|string|in:active,resolved',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $alert = Alert::create($request->all());
        return $this->successResponse($alert->load('asset'), 'Alert created successfully', 201);
    }

    public function show($id)
    {
        $alert = Alert::with('asset')->find($id);

        if (!$alert) {
            return $this->notFoundResponse('Alert not found');
        }

        return $this->successResponse($alert, 'Alert retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $alert = Alert::find($id);

        if (!$alert) {
            return $this->notFoundResponse('Alert not found');
        }

        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'alert_type' => 'required|string|max:255',
            'message' => 'required|string',
            'trigger_date' => 'required|date',
            'status' => 'required|string|in:active,resolved',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $alert->update($request->all());
        return $this->successResponse($alert->load('asset'), 'Alert updated successfully');
    }

    public function destroy($id)
    {
        $alert = Alert::find($id);

        if (!$alert) {
            return $this->notFoundResponse('Alert not found');
        }

        $alert->delete();
        return $this->successResponse(null, 'Alert deleted successfully');
    }
}
