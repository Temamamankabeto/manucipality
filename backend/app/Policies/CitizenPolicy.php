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
        return $this->canAny($user, ['citizens.read', 'citizens.view']);
    }

    public function view(User $user, Citizen $citizen): bool
    {
        return $this->canAny($user, ['citizens.read', 'citizens.view']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN)
            && $user->admin_level === User::LEVEL_ZONE
            && $this->canAny($user, ['citizens.create']);
    }

    public function update(User $user, Citizen $citizen): bool
    {
        return $user->hasRole(User::ROLE_ADMIN)
            && $user->admin_level === User::LEVEL_ZONE
            && $this->canAny($user, ['citizens.update']);
    }

    public function delete(User $user, Citizen $citizen): bool
    {
        return $this->canAny($user, ['citizens.delete']);
    }

    public function submit(User $user, Citizen $citizen): bool
    {
        return $user->hasRole(User::ROLE_ADMIN)
            && $user->admin_level === User::LEVEL_ZONE
            && $this->canAny($user, ['citizens.submit']);
    }

    public function manageDocuments(User $user, Citizen $citizen): bool
    {
        return $user->hasRole(User::ROLE_ADMIN)
            && $user->admin_level === User::LEVEL_ZONE
            && $this->canAny($user, ['citizen-documents.manage']);
    }

    public function managePhoto(User $user, Citizen $citizen): bool
    {
        return $user->hasRole(User::ROLE_ADMIN)
            && $user->admin_level === User::LEVEL_ZONE
            && $this->canAny($user, ['citizen-photo.manage']);
    }

    public function checkDuplicates(User $user): bool
    {
        return $this->canAny($user, ['citizen-duplicates.check', 'citizens.workflow.flag']);
    }

    protected function canAny(User $user, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($user->can($permission)) {
                return true;
            }
        }

        return false;
    }
}
