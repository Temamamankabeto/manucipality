<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\IndexCitizenReportRequest;
use App\Services\CitizenReportService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CitizenReportController extends Controller
{
    public function __construct(protected CitizenReportService $reportService) {}

    public function metrics(IndexCitizenReportRequest $request): JsonResponse|StreamedResponse
    {
        abort_unless($request->user()->can('dashboard.citizens.view'), 403);
        return $this->respond($request, 'citizen-dashboard-metrics', $this->reportService->metrics($request->validated(), $request->user()), 'Citizen dashboard metrics retrieved successfully');
    }

    public function gender(IndexCitizenReportRequest $request): JsonResponse|StreamedResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->respond($request, 'gender-distribution', $this->reportService->genderDistribution($request->validated(), $request->user()), 'Gender distribution retrieved successfully');
    }

    public function age(IndexCitizenReportRequest $request): JsonResponse|StreamedResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->respond($request, 'age-distribution', $this->reportService->ageDistribution($request->validated(), $request->user()), 'Age distribution retrieved successfully');
    }

    public function households(IndexCitizenReportRequest $request): JsonResponse|StreamedResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->respond($request, 'household-report', $this->reportService->householdReport($request->validated(), $request->user()), 'Household report retrieved successfully');
    }

    public function trends(IndexCitizenReportRequest $request): JsonResponse|StreamedResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->respond($request, 'registration-trends', $this->reportService->registrationTrends($request->validated(), $request->user()), 'Registration trends retrieved successfully');
    }

    public function suspended(IndexCitizenReportRequest $request): JsonResponse|StreamedResponse
    {
        abort_unless($request->user()->can('reports.citizens.view'), 403);
        return $this->respond($request, 'suspended-citizens', $this->reportService->suspendedCitizens($request->validated(), $request->user()), 'Suspended citizens report retrieved successfully');
    }

    protected function respond(IndexCitizenReportRequest $request, string $filename, array $data, string $message): JsonResponse|StreamedResponse
    {
        $export = strtolower((string) $request->query('export', ''));

        if (in_array($export, ['csv', 'pdf'], true)) {
            abort_unless($request->user()->can('reports.export'), 403);
            return $this->csv($filename . '-' . now()->format('YmdHis') . '.csv', $this->flattenForCsv($data));
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);
    }

    protected function csv(string $filename, array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');

            if ($rows === []) {
                fputcsv($handle, ['No data']);
                fclose($handle);
                return;
            }

            $headers = array_keys($rows[0]);
            fputcsv($handle, $headers);

            foreach ($rows as $row) {
                fputcsv($handle, array_map(fn ($value) => is_array($value) ? json_encode($value) : $value, $row));
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    protected function flattenForCsv(array $data): array
    {
        if ($data === []) {
            return [];
        }

        $isList = array_is_list($data);
        $rows = $isList ? $data : [$data];

        return collect($rows)->map(function ($row) {
            if (! is_array($row)) {
                return ['value' => $row];
            }

            $flat = [];
            foreach ($row as $key => $value) {
                $flat[$key] = is_array($value) ? json_encode($value) : $value;
            }
            return $flat;
        })->values()->all();
    }
}
