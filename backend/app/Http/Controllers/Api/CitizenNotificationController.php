<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Services\AppNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenNotificationController extends Controller
{
    public function __construct(protected AppNotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('notifications.read'), 403);

        return response()->json(
            $this->notificationService->transformPaginated(
                $this->notificationService->paginateForUser($request->user(), $request->only(['status', 'type', 'per_page']))
            )
        );
    }

    public function unreadCount(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('notifications.read'), 403);

        $count = AppNotification::query()
            ->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)->orWhereNull('user_id');
            })
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Unread notification count retrieved successfully',
            'data' => ['count' => $count],
        ]);
    }

    public function markAsRead(Request $request, AppNotification $notification): JsonResponse
    {
        abort_unless($request->user()->can('notifications.read'), 403);

        if ($notification->user_id && (int) $notification->user_id !== (int) $request->user()->id) {
            abort(404);
        }

        $notification->forceFill(['read_at' => now()])->save();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'data' => $this->notificationService->transform($notification),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('notifications.read'), 403);

        AppNotification::query()
            ->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)->orWhereNull('user_id');
            })
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
            'data' => null,
        ]);
    }

    public function destroy(Request $request, AppNotification $notification): JsonResponse
    {
        abort_unless($request->user()->can('notifications.read'), 403);

        if ($notification->user_id && (int) $notification->user_id !== (int) $request->user()->id) {
            abort(404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully',
            'data' => null,
        ]);
    }
}
