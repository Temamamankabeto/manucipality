<?php

namespace App\Policies;

use App\Models\Household;
use App\Models\User;

class HouseholdPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('households.read');
    }

    public function view(User $user, Household $household): bool
    {
        return $user->can('households.read');
    }

    public function create(User $user): bool
    {
        return $user->can('households.create');
    }

    public function update(User $user, Household $household): bool
    {
        return $user->can('households.update');
    }

    public function delete(User $user, Household $household): bool
    {
        return $user->can('households.delete');
    }
}
