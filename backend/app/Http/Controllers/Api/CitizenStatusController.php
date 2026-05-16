<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenStatusController extends Controller
{
    public function deactivate(Request $request, Citizen $citizen): JsonResponse
    {
        abort_unless($request->user()->can('citizens.deactivate'), 403);
        abort_unless($request->user()->isSuperAdmin(), 403, 'Only Super Admin can deactivate citizens.');

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $from = $citizen->status;
        $citizen->forceFill([
            'status' => Citizen::STATUS_SUSPENDED,
            'deactivated_at' => now(),
            'deactivation_reason' => $data['reason'],
            'last_status_changed_by' => $request->user()->id,
        ])->save();

        $citizen->statusHistories()->create([
            'from_status' => $from,
            'to_status' => Citizen::STATUS_SUSPENDED,
            'reason' => $data['reason'],
            'changed_by' => $request->user()->id,
            'metadata' => ['action' => 'deactivate'],
        ]);

        $this->activity('citizen.deactivated', $citizen, $request->user(), ['reason' => $data['reason']]);

        return response()->json([
            'success' => true,
            'message' => 'Citizen deactivated successfully',
            'data' => $citizen->fresh(),
        ]);
    }

    public function reactivate(Request $request, Citizen $citizen): JsonResponse
    {
        abort_unless($request->user()->can('citizens.reactivate'), 403);
        abort_unless($request->user()->isSuperAdmin(), 403, 'Only Super Admin can reactivate citizens.');

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $from = $citizen->status;
        $citizen->forceFill([
            'status' => Citizen::STATUS_ACTIVE,
            'reactivated_at' => now(),
            'last_status_changed_by' => $request->user()->id,
        ])->save();

        $citizen->statusHistories()->create([
            'from_status' => $from,
            'to_status' => Citizen::STATUS_ACTIVE,
            'reason' => $data['reason'] ?? 'Citizen reactivated.',
            'changed_by' => $request->user()->id,
            'metadata' => ['action' => 'reactivate'],
        ]);

        $this->activity('citizen.reactivated', $citizen, $request->user(), ['reason' => $data['reason'] ?? null]);

        return response()->json([
            'success' => true,
            'message' => 'Citizen reactivated successfully',
            'data' => $citizen->fresh(),
        ]);
    }

    protected function activity(string $event, Citizen $citizen, $actor, array $properties = []): void
    {
        if (function_exists('activity')) {
            activity()->causedBy($actor)->performedOn($citizen)->withProperties($properties)->event($event)->log($event);
        }
    }
}
