<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Household extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';

    protected $fillable = [
        'household_number',
        'head_citizen_id',
        'city_id',
        'subcity_id',
        'woreda_id',
        'zone_id',
        'house_number',
        'address',
        'status',
        'created_by',
    ];

    public function headCitizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'head_citizen_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }

    public function activeMembers(): HasMany
    {
        return $this->members()->where('status', HouseholdMember::STATUS_ACTIVE);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'city_id');
    }

    public function subcity(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'subcity_id');
    }

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'woreda_id');
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'zone_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
