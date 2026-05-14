<?php

namespace App\Policies;

use App\Models\Citizen;
use App\Models\User;

class CitizenPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('Super Admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('citizens.read');
    }

    public function view(User $user, Citizen $citizen): bool
    {
        return $user->can('citizens.read');
    }

    public function create(User $user): bool
    {
        return $user->can('citizens.create');
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
