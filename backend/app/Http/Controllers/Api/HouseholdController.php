<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Household\IndexHouseholdRequest;
use App\Http\Requests\Household\StoreHouseholdRequest;
use App\Http\Requests\Household\UpdateHouseholdRequest;
use App\Models\Household;
use App\Services\HouseholdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HouseholdController extends Controller
{
    public function __construct(protected HouseholdService $householdService) {}

    public function index(IndexHouseholdRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('households.read'), 403);

        return response()->json(
            $this->householdService->transformPaginated(
                $this->householdService->paginate($request->validated(), $request->user())
            )
        );
    }

    public function store(StoreHouseholdRequest $request): JsonResponse
    {
        abort_unless($request->user()->can('households.create'), 403);

        $household = $this->householdService->create($request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Household created successfully',
            'data' => $this->householdService->transform($household),
        ], 201);
    }

    public function show(Request $request, Household $household): JsonResponse
    {
        abort_unless($request->user()->can('households.read'), 403);

        return response()->json([
            'success' => true,
            'message' => 'Household retrieved successfully',
            'data' => $this->householdService->transform($this->householdService->get($household->id, $request->user())),
        ]);
    }

    public function update(UpdateHouseholdRequest $request, Household $household): JsonResponse
    {
        abort_unless($request->user()->can('households.update'), 403);

        $household = $this->householdService->update($household, $request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Household updated successfully',
            'data' => $this->householdService->transform($household),
        ]);
    }

    public function destroy(Request $request, Household $household): JsonResponse
    {
        abort_unless($request->user()->can('households.delete'), 403);
        $this->householdService->delete($household, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Household deleted successfully',
            'data' => null,
        ]);
    }
}
