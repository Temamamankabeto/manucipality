<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\StoreCitizenDocumentRequest;
use App\Http\Requests\Citizen\UpdateCitizenDocumentRequest;
use App\Models\Citizen;
use App\Models\CitizenDocument;
use App\Services\CitizenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CitizenDocumentController extends Controller
{
    public function __construct(protected CitizenService $citizenService) {}

    public function index(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('view', $citizen);
        $this->citizenService->assertCanAccess($citizen, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen documents retrieved successfully',
            'data' => $citizen->documents()->with('uploadedBy:id,name,email')->latest()->get(),
        ]);
    }

    public function store(StoreCitizenDocumentRequest $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('manageDocuments', $citizen);

        $document = $this->citizenService->storeDocument(
            $citizen,
            $request->validated(),
            $request->file('file'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Citizen document uploaded successfully',
            'data' => $document,
        ], 201);
    }

    public function show(Request $request, Citizen $citizen, CitizenDocument $document): JsonResponse
    {
        $this->authorize('view', $citizen);
        $this->citizenService->assertCanAccess($citizen, $request->user());

        if ($document->citizen_id !== $citizen->id) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Citizen document retrieved successfully',
            'data' => $document->load('uploadedBy:id,name,email'),
        ]);
    }

    public function download(Request $request, Citizen $citizen, CitizenDocument $document)
    {
        $this->authorize('view', $citizen);
        $this->citizenService->assertCanAccess($citizen, $request->user());

        if ($document->citizen_id !== $citizen->id || ! Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($document->file_path, $document->original_name ?: basename($document->file_path));
    }

    public function update(UpdateCitizenDocumentRequest $request, Citizen $citizen, CitizenDocument $document): JsonResponse
    {
        $this->authorize('manageDocuments', $citizen);

        $document = $this->citizenService->updateDocument(
            $citizen,
            $document,
            $request->validated(),
            $request->file('file'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Citizen document updated successfully',
            'data' => $document,
        ]);
    }

    public function destroy(Request $request, Citizen $citizen, CitizenDocument $document): JsonResponse
    {
        $this->authorize('manageDocuments', $citizen);
        $this->citizenService->deleteDocument($citizen, $document, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen document deleted successfully',
            'data' => null,
        ]);
    }
}
