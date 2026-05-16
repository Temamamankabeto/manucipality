<?php

namespace App\Policies;

use App\Models\Citizen;
use App\Models\User;

class CitizenPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole(User::ROLE_SUPER_ADMIN) ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('citizens.read') || $user->can('citizens.view');
    }

    public function view(User $user, Citizen $citizen): bool
    {
        return $user->can('citizens.read') || $user->can('citizens.view');
    }

    public function create(User $user): bool
    {
        return $user->can('citizens.create') && $user->hasRole(User::ROLE_ADMIN) && $user->admin_level === User::LEVEL_ZONE;
    }

    public function update(User $user, Citizen $citizen): bool
    {
        return $user->can('citizens.update');
    }

    public function delete(User $user, Citizen $citizen): bool
    {
        return $user->can('citizens.delete');
    }

    public function submit(User $user, Citizen $citizen): bool
    {
        return $user->can('citizens.submit');
    }

    public function manageDocuments(User $user, Citizen $citizen): bool
    {
        return $user->can('citizen-documents.manage');
    }

    public function managePhoto(User $user, Citizen $citizen): bool
    {
        return $user->can('citizen-photo.manage');
    }

    public function checkDuplicates(User $user): bool
    {
        return $user->can('citizen-duplicates.check');
    }
}
