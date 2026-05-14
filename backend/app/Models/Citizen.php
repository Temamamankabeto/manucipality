<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Citizen extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_SUSPENDED = 'suspended';

    protected $fillable = [
        'registration_number',
        'national_id',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'date_of_birth',
        'place_of_birth',
        'nationality',
        'marital_status',
        'phone',
        'email',
        'occupation',
        'education_level',
        'disability_status',
        'emergency_contact',
        'photo_path',
        'registration_channel',
        'status',
        'city_id',
        'subcity_id',
        'woreda_id',
        'zone_id',
        'registered_by',
        'last_status_changed_by',
        'submitted_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'disability_status' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    protected $appends = ['full_name', 'photo_url'];

    public function documents(): HasMany
    {
        return $this->hasMany(CitizenDocument::class);
    }

    public function address(): HasOne
    {
        return $this->hasOne(CitizenAddress::class)->where('is_current', true)->latestOfMany();
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CitizenAddress::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(CitizenStatusHistory::class)->latest();
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
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

    public function getFullNameAttribute(): string
    {
        return trim(collect([$this->first_name, $this->middle_name, $this->last_name])->filter()->join(' '));
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? asset('storage/' . $this->photo_path) : null;
    }
}
