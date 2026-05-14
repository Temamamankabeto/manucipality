<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\IndexCitizenReportRequest;
use App\Services\CitizenReportService;
use Illuminate\Http\JsonResponse;

class CitizenReportController extends Controller
{
    public function __construct(protected CitizenReportService $reportService) {}

    public function metrics(IndexCitizenReportRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('dashboard.citizens.view'), 403);
        return $this->ok('Citizen dashboard metrics retrieved successfully', $this->reportService->metrics($request->validated(), $request->user()));
    }

    public function gender(IndexCitizenReportRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->ok('Gender distribution retrieved successfully', $this->reportService->genderDistribution($request->validated(), $request->user()));
    }

    public function age(IndexCitizenReportRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->ok('Age distribution retrieved successfully', $this->reportService->ageDistribution($request->validated(), $request->user()));
    }

    public function households(IndexCitizenReportRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->ok('Household report retrieved successfully', $this->reportService->householdReport($request->validated(), $request->user()));
    }

    public function trends(IndexCitizenReportRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->ok('Registration trends retrieved successfully', $this->reportService->registrationTrends($request->validated(), $request->user()));
    }

    public function suspended(IndexCitizenReportRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->ok('Suspended citizens report retrieved successfully', $this->reportService->suspendedCitizens($request->validated(), $request->user()));
    }

    protected function ok(string $message, array $data): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
