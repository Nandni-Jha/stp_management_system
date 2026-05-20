<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\AssetDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class AssetDocumentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = AssetDocument::with('asset');

        if ($request->has('asset_id') && $request->asset_id !== '') {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('document_type') && $request->document_type !== '') {
            $query->where('document_type', $request->document_type);
        }

        $assetDocuments = $query->orderBy('created_at', 'desc')->get();
        return $this->successResponse($assetDocuments, 'Asset documents retrieved successfully');
    }

    public function store(Request $request)
    {
        $validationData = [
            'asset_id' => $request->input('asset_id'),
            'document_type' => $request->input('document_type'),
            'document_number' => $request->input('document_number'),
            'expiry_date' => $request->input('expiry_date'),
            'file' => $request->file('file'),
        ];

        $validator = Validator::make($validationData, [
            'asset_id' => 'required|exists:assets,id',
            'document_type' => 'required|string|max:255',
            'document_number' => 'required|string|max:255',
            'expiry_date' => 'nullable|date',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $filePath = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $fileName = $request->asset_id . '-' . $request->document_number . '.' . $extension;

            // Create directory if it doesn't exist
            $uploadPath = public_path('uploads/documents');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }

            // Move file to public/uploads/documents directory
            $file->move($uploadPath, $fileName);
            $filePath = 'uploads/documents/' . $fileName;
        }

        $data = $request->except('file');
        $data['file_path'] = $filePath;

        $assetDocument = AssetDocument::create($data);
        return $this->successResponse($assetDocument->load('asset'), 'Asset document created successfully', 201);
    }

    public function show($id)
    {
        $assetDocument = AssetDocument::with('asset')->find($id);

        if (!$assetDocument) {
            return $this->notFoundResponse('Asset document not found');
        }

        return $this->successResponse($assetDocument, 'Asset document retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $assetDocument = AssetDocument::find($id);

        if (!$assetDocument) {
            return $this->notFoundResponse('Asset document not found');
        }

        $validationData = [
            'asset_id' => $request->input('asset_id'),
            'document_type' => $request->input('document_type'),
            'document_number' => $request->input('document_number'),
            'expiry_date' => $request->input('expiry_date'),
            'file' => $request->file('file'),
        ];

        $validator = Validator::make($validationData, [
            'asset_id' => 'required|exists:assets,id',
            'document_type' => 'required|string|max:255',
            'document_number' => 'required|string|max:255',
            'expiry_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $filePath = $assetDocument->file_path;

        if ($request->hasFile('file')) {
            // Delete old file if exists
            $oldFilePath = public_path($filePath);
            if ($filePath && File::exists($oldFilePath)) {
                File::delete($oldFilePath);
            }

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $fileName = $request->asset_id . '-' . $request->document_number . '.' . $extension;

            // Create directory if it doesn't exist
            $uploadPath = public_path('uploads/documents');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }

            // Move file to public/uploads/documents directory
            $file->move($uploadPath, $fileName);
            $filePath = 'uploads/documents/' . $fileName;
        }

        $data = $request->except('file');
        $data['file_path'] = $filePath;

        $assetDocument->update($data);
        return $this->successResponse($assetDocument->load('asset'), 'Asset document updated successfully');
    }

    public function download($id)
    {
        $assetDocument = AssetDocument::find($id);

        if (!$assetDocument || !$assetDocument->file_path) {
            return $this->notFoundResponse('Document file not found');
        }

        $filePath = public_path($assetDocument->file_path);
        if (!File::exists($filePath)) {
            return $this->notFoundResponse('File not found on disk');
        }

        return response()->download($filePath);
    }

    public function destroy($id)
    {
        $assetDocument = AssetDocument::find($id);

        if (!$assetDocument) {
            return $this->notFoundResponse('Asset document not found');
        }

        // Delete the physical file if it exists
        $filePath = public_path($assetDocument->file_path);
        if ($assetDocument->file_path && File::exists($filePath)) {
            File::delete($filePath);
        }

        $assetDocument->delete();
        return $this->successResponse(null, 'Asset document deleted successfully');
    }
}
