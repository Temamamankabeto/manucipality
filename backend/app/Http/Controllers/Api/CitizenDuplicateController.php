<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Models\CitizenDuplicateFlag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CitizenDuplicateController extends Controller
{
    public function resolve(Request $request, CitizenDuplicateFlag $flag): JsonResponse
    {
        $this->authorizeAction($request, 'citizens.duplicates.resolve');

        $data = $request->validate([
            'resolution_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->assertFlagVisible($request, $flag);

        $flag->forceFill([
            'status' => CitizenDuplicateFlag::STATUS_RESOLVED,
            'resolution_note' => $data['resolution_note'] ?? 'Duplicate flag resolved.',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ])->save();

        $this->activity('duplicate.resolved', $flag->citizen, $request->user(), ['flag_id' => $flag->id]);

        return response()->json([
            'success' => true,
            'message' => 'Duplicate flag resolved successfully',
            'data' => $flag->fresh(['citizen', 'matchedCitizen', 'flaggedBy']),
        ]);
    }

    public function dismiss(Request $request, CitizenDuplicateFlag $flag): JsonResponse
    {
        $this->authorizeAction($request, 'citizens.duplicates.dismiss');

        $data = $request->validate([
            'resolution_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->assertFlagVisible($request, $flag);

        $flag->forceFill([
            'status' => 'dismissed',
            'resolution_note' => $data['resolution_note'] ?? 'Duplicate flag dismissed as false positive.',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ])->save();

        $this->activity('duplicate.dismissed', $flag->citizen, $request->user(), ['flag_id' => $flag->id]);

        return response()->json([
            'success' => true,
            'message' => 'Duplicate flag dismissed successfully',
            'data' => $flag->fresh(['citizen', 'matchedCitizen', 'flaggedBy']),
        ]);
    }

    public function merge(Request $request, Citizen $citizen): JsonResponse
    {
        $this->authorizeAction($request, 'citizens.merge');

        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Only Super Admin can merge duplicate citizens.');
        }

        $data = $request->validate([
            'target_citizen_id' => ['required', 'integer', 'exists:citizens,id'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        if ((int) $data['target_citizen_id'] === (int) $citizen->id) {
            throw ValidationException::withMessages(['target_citizen_id' => ['Target citizen must be different from duplicate citizen.']]);
        }

        $target = Citizen::findOrFail($data['target_citizen_id']);

        DB::transaction(function () use ($citizen, $target, $request, $data) {
            DB::table('citizen_documents')->where('citizen_id', $citizen->id)->update(['citizen_id' => $target->id]);
            DB::table('citizen_addresses')->where('citizen_id', $citizen->id)->update(['citizen_id' => $target->id]);
            DB::table('citizen_status_histories')->where('citizen_id', $citizen->id)->update(['citizen_id' => $target->id]);
            DB::table('citizen_approvals')->where('citizen_id', $citizen->id)->update(['citizen_id' => $target->id]);
            DB::table('citizen_duplicate_flags')->where('citizen_id', $citizen->id)->update(['citizen_id' => $target->id, 'status' => CitizenDuplicateFlag::STATUS_RESOLVED, 'resolved_by' => $request->user()->id, 'resolved_at' => now(), 'resolution_note' => $data['reason']]);
            DB::table('citizen_duplicate_flags')->where('matched_citizen_id', $citizen->id)->update(['matched_citizen_id' => $target->id, 'status' => CitizenDuplicateFlag::STATUS_RESOLVED, 'resolved_by' => $request->user()->id, 'resolved_at' => now(), 'resolution_note' => $data['reason']]);

            if (DB::getSchemaBuilder()->hasTable('household_members')) {
                DB::table('household_members')->where('citizen_id', $citizen->id)->update(['citizen_id' => $target->id]);
            }

            $citizen->forceFill([
                'status' => Citizen::STATUS_SUSPENDED,
                'merged_into_citizen_id' => $target->id,
                'merged_by' => $request->user()->id,
                'merged_at' => now(),
                'suspended_at' => now(),
                'deactivation_reason' => $data['reason'],
            ])->save();

            $this->activity('citizen.merged_duplicate', $citizen, $request->user(), ['target_citizen_id' => $target->id, 'reason' => $data['reason']]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Duplicate citizen merged successfully',
            'data' => $target->fresh(),
        ]);
    }

    protected function authorizeAction(Request $request, string $permission): void
    {
        abort_unless($request->user()->can($permission), 403);
    }

    protected function assertFlagVisible(Request $request, CitizenDuplicateFlag $flag): void
    {
        $actor = $request->user();
        $flag->loadMissing('citizen');

        if ($actor->isSuperAdmin()) {
            return;
        }

        $citizen = $flag->citizen;
        $allowed = match ($actor->admin_level) {
            'city' => (int) $citizen->city_id === (int) $actor->office_id,
            'subcity' => (int) $citizen->subcity_id === (int) $actor->office_id,
            'woreda' => (int) $citizen->woreda_id === (int) $actor->office_id,
            'zone' => (int) $citizen->zone_id === (int) $actor->office_id,
            default => false,
        };

        abort_unless($allowed, 404);
    }

    protected function activity(string $event, Citizen $citizen, $actor, array $properties = []): void
    {
        if (function_exists('activity')) {
            activity()->causedBy($actor)->performedOn($citizen)->withProperties($properties)->event($event)->log($event);
        }
    }
}
