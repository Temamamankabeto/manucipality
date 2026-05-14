<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\CitizenDocumentVerificationRequest;
use App\Http\Requests\Citizen\CitizenWorkflowActionRequest;
use App\Http\Requests\Citizen\IndexCitizenWorkflowRequest;
use App\Models\Citizen;
use App\Services\CitizenWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CitizenWorkflowController extends Controller
{
    public function __construct(protected CitizenWorkflowService $workflowService) {}

    public function pending(IndexCitizenWorkflowRequest $request): JsonResponse
    {
        $queue = $this->workflowService->pending($request->validated(), $request->user());

        return response()->json($this->workflowService->transformPaginated($queue));
    }

    public function duplicates(Request $request): JsonResponse
    {
        $flags = $this->workflowService->duplicateFlags($request->only(['status', 'page', 'per_page']), $request->user());

        return response()->json($this->workflowService->transformDuplicateFlags($flags));
    }

    public function workflow(Request $request, Citizen $citizen): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Citizen workflow retrieved successfully',
            'data' => $this->workflowService->workflow($citizen, $request->user()),
        ]);
    }

    public function startReview(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        return $this->citizenResponse(
            'Review started successfully',
            $this->workflowService->startReview($citizen, $request->user(), $request->validated()['remarks'] ?? null)
        );
    }

    public function verifyDocuments(CitizenDocumentVerificationRequest $request, Citizen $citizen): JsonResponse
    {
        $data = $request->validated();

        return $this->citizenResponse(
            'Documents verified successfully',
            $this->workflowService->verifyDocuments($citizen, $request->user(), $data['documents'] ?? [], $data['remarks'] ?? null)
        );
    }

    public function woredaVerify(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        return $this->citizenResponse(
            'Woreda verification completed successfully',
            $this->workflowService->woredaVerify($citizen, $request->user(), $request->validated()['remarks'] ?? null)
        );
    }

    public function subcityApprove(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        return $this->citizenResponse(
            'Subcity approval completed successfully',
            $this->workflowService->subcityApprove($citizen, $request->user(), $request->validated()['remarks'] ?? null)
        );
    }

    public function generateId(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        return $this->citizenResponse(
            'Citizen ID generated successfully',
            $this->workflowService->generateId($citizen, $request->user(), $request->validated()['remarks'] ?? null)
        );
    }

    public function activate(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        return $this->citizenResponse(
            'Citizen activated successfully',
            $this->workflowService->activate($citizen, $request->user(), $request->validated()['remarks'] ?? null)
        );
    }

    public function reject(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        $reason = $request->validated()['reason'] ?? $request->validated()['remarks'] ?? null;
        if (! $reason) {
            throw ValidationException::withMessages(['reason' => ['Reject reason is required.']]);
        }

        return $this->citizenResponse(
            'Citizen rejected successfully',
            $this->workflowService->reject($citizen, $request->user(), $reason)
        );
    }

    public function flag(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        $reason = $request->validated()['reason'] ?? $request->validated()['remarks'] ?? null;
        if (! $reason) {
            throw ValidationException::withMessages(['reason' => ['Flag reason is required.']]);
        }

        return $this->citizenResponse(
            'Citizen flagged successfully',
            $this->workflowService->flag($citizen, $request->user(), $reason)
        );
    }

    public function suspend(CitizenWorkflowActionRequest $request, Citizen $citizen): JsonResponse
    {
        $reason = $request->validated()['reason'] ?? $request->validated()['remarks'] ?? null;
        if (! $reason) {
            throw ValidationException::withMessages(['reason' => ['Suspension reason is required.']]);
        }

        return $this->citizenResponse(
            'Citizen suspended successfully',
            $this->workflowService->suspend($citizen, $request->user(), $reason)
        );
    }

    protected function citizenResponse(string $message, Citizen $citizen): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $this->workflowService->workflow($citizen, request()->user()),
        ]);
    }
}
