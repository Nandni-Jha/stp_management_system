<?php

namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data = null, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    protected function errorResponse($message = 'Error', $errors = null, $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    protected function validationErrorResponse($errors)
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors,
        ], 422);
    }

    protected function unauthorizedResponse($message = 'Unauthorized')
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }

    protected function notFoundResponse($message = 'Resource not found')
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 404);
    }
}
