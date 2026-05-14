<?php

namespace App\Policies;

use App\Models\Office;
use App\Models\User;

class OfficePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('offices.read')
            || $user->can('offices.create')
            || $user->can('offices.update')
            || $user->can('offices.delete');
    }

    public function view(User $user, Office $office): bool
    {
        return $user->can('offices.read');
    }

    public function create(User $user): bool
    {
        return $user->can('offices.create');
    }

    public function update(User $user, Office $office): bool
    {
        return $user->can('offices.update');
    }

    public function delete(User $user, Office $office): bool
    {
        return $user->can('offices.delete');
    }

    public function toggle(User $user, Office $office): bool
    {
        return $user->can('offices.update');
    }
}
