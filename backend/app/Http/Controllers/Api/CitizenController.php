<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\IndexCitizenRequest;
use App\Http\Requests\Citizen\StoreCitizenRequest;
use App\Http\Requests\Citizen\UpdateCitizenRequest;
use App\Models\Citizen;
use App\Services\CitizenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CitizenController extends Controller
{
    public function __construct(protected CitizenService $citizenService) {}

    public function index(IndexCitizenRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Citizen::class);

        $citizens = $this->citizenService->paginateCitizens($request->validated(), $request->user());

        return response()->json($this->citizenService->transformPaginated($citizens));
    }

    public function store(StoreCitizenRequest $request): JsonResponse
    {
        $this->authorize('create', Citizen::class);

        $citizen = $this->citizenService->createCitizen(
            $request->validated(),
            $request->user(),
            $request->file('photo')
        );

        return response()->json([
            'success' => true,
            'message' => 'Citizen registration draft created successfully',
            'data' => $this->citizenService->transform($citizen),
        ], 201);
    }

    public function show(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('view', $citizen);

        $citizen = $this->citizenService->getCitizen($citizen->id, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen retrieved successfully',
            'data' => $this->citizenService->transform($citizen),
        ]);
    }

    public function update(UpdateCitizenRequest $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('update', $citizen);

        $citizen = $this->citizenService->updateCitizen(
            $citizen,
            $request->validated(),
            $request->user(),
            $request->file('photo')
        );

        return response()->json([
            'success' => true,
            'message' => 'Citizen updated successfully',
            'data' => $this->citizenService->transform($citizen),
        ]);
    }

    public function destroy(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('delete', $citizen);
        $this->citizenService->deleteCitizen($citizen, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen deleted successfully',
            'data' => null,
        ]);
    }

    public function submit(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('submit', $citizen);

        $citizen = $this->citizenService->submitCitizen($citizen, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen submitted for verification successfully',
            'data' => $this->citizenService->transform($citizen),
        ]);
    }

    public function validateDuplicate(Request $request): JsonResponse
    {
        $this->authorize('checkDuplicates', Citizen::class);

        $data = $request->validate([
            'national_id' => ['nullable', 'string', 'max:100', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:40', 'required_without:national_id'],
            'exclude_citizen_id' => ['nullable', 'integer', 'exists:citizens,id'],
        ]);

        $matches = $this->citizenService->duplicateCheck(
            $data['national_id'] ?? null,
            $data['phone'] ?? null,
            $data['exclude_citizen_id'] ?? null,
        );

        return response()->json([
            'success' => true,
            'message' => count($matches) ? 'Possible duplicate records found' : 'No duplicate record found',
            'data' => [
                'has_duplicates' => count($matches) > 0,
                'matches' => $matches,
            ],
        ]);
    }

    public function checkNationalId(string $nationalId): JsonResponse
    {
        $this->authorize('checkDuplicates', Citizen::class);

        $matches = $this->citizenService->duplicateCheck($nationalId, null);

        return response()->json([
            'success' => true,
            'message' => count($matches) ? 'National ID already exists' : 'National ID is available',
            'data' => [
                'exists' => count($matches) > 0,
                'matches' => $matches,
            ],
        ]);
    }

    public function checkPhone(string $phone): JsonResponse
    {
        $this->authorize('checkDuplicates', Citizen::class);

        $matches = $this->citizenService->duplicateCheck(null, $phone);

        return response()->json([
            'success' => true,
            'message' => count($matches) ? 'Phone number already exists' : 'Phone number is available',
            'data' => [
                'exists' => count($matches) > 0,
                'matches' => $matches,
            ],
        ]);
    }

    public function uploadPhoto(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('managePhoto', $citizen);

        $data = $request->validate([
            'photo' => ['required', 'image', 'max:4096'],
        ]);

        $citizen = $this->citizenService->uploadPhoto($citizen, $request->file('photo'), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen photo uploaded successfully',
            'data' => $this->citizenService->transform($citizen),
        ]);
    }

    public function removePhoto(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorize('managePhoto', $citizen);

        $citizen = $this->citizenService->removePhoto($citizen, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Citizen photo removed successfully',
            'data' => $this->citizenService->transform($citizen),
        ]);
    }
}
