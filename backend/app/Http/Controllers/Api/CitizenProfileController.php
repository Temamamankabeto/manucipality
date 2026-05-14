<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Services\CitizenProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenProfileController extends Controller
{
    public function __construct(protected CitizenProfileService $profileService) {}

    public function show(Request $request, Citizen $citizen): JsonResponse
    {
        abort_unless($request->user()->can('citizens.profile.view'), 403);

        return response()->json([
            'success' => true,
            'message' => 'Citizen profile retrieved successfully',
            'data' => $this->profileService->profile($citizen, $request->user()),
        ]);
    }
}
