<?php

namespace App\Services;

use App\Models\CitizenNotification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CitizenNotificationService
{
    public function paginate(array $filters, User $actor): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));

        $query = CitizenNotification::query()
            ->with(['citizen:id,registration_number,citizen_uid,first_name,middle_name,last_name,phone,status', 'user:id,name,email'])
            ->latest();

        if (! $actor->isSuperAdmin()) {
            $query->where(function ($q) use ($actor) {
                $q->where('user_id', $actor->id)
                    ->orWhereHas('citizen', function ($citizenQuery) use ($actor) {
                        $column = match ($actor->admin_level) {
                            User::LEVEL_CITY => 'city_id',
                            User::LEVEL_SUBCITY => 'subcity_id',
                            User::LEVEL_WOREDA => 'woreda_id',
                            User::LEVEL_ZONE => 'zone_id',
                            default => null,
                        };
                        $column ? $citizenQuery->where($column, $actor->office_id) : $citizenQuery->whereRaw('1 = 0');
                    });
            });
        }

        foreach (['status', 'channel', 'type'] as $field) {
            if (filled($filters[$field] ?? null)) {
                $query->where($field, $filters[$field]);
            }
        }

        return $query->paginate($perPage);
    }

    public function transformPaginated(LengthAwarePaginator $notifications): array
    {
        return [
            'success' => true,
            'message' => 'Notifications retrieved successfully',
            'data' => collect($notifications->items())->map(fn (CitizenNotification $notification) => $this->transform($notification))->values(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ],
        ];
    }

    public function transform(CitizenNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'citizen_id' => $notification->citizen_id,
            'user_id' => $notification->user_id,
            'type' => $notification->type,
            'channel' => $notification->channel,
            'title' => $notification->title,
            'body' => $notification->body,
            'status' => $notification->status,
            'metadata' => $notification->metadata,
            'sent_at' => optional($notification->sent_at)->toISOString(),
            'read_at' => optional($notification->read_at)->toISOString(),
            'citizen' => $notification->citizen,
            'user' => $notification->user,
            'created_at' => optional($notification->created_at)->toISOString(),
        ];
    }
}
