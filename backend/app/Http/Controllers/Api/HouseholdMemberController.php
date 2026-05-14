<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Household\StoreHouseholdMemberRequest;
use App\Http\Requests\Household\UpdateHouseholdMemberRequest;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Services\HouseholdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HouseholdMemberController extends Controller
{
    public function __construct(protected HouseholdService $householdService) {}

    public function store(StoreHouseholdMemberRequest $request, Household $household): JsonResponse
    {
        abort_unless($request->user()->can('households.update'), 403);

        $member = $this->householdService->addMember($household, $request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Household member added successfully',
            'data' => $this->householdService->memberPayload($member),
        ], 201);
    }

    public function update(UpdateHouseholdMemberRequest $request, Household $household, HouseholdMember $member): JsonResponse
    {
        abort_unless($request->user()->can('households.update'), 403);

        $member = $this->householdService->updateMember($household, $member, $request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Household member updated successfully',
            'data' => $this->householdService->memberPayload($member),
        ]);
    }

    public function destroy(Request $request, Household $household, HouseholdMember $member): JsonResponse
    {
        abort_unless($request->user()->can('households.update'), 403);
        $this->householdService->removeMember($household, $member, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Household member removed successfully',
            'data' => null,
        ]);
    }
}
