<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenDuplicateFlag extends Model
{
    use HasFactory;

    public const STATUS_OPEN = 'open';
    public const STATUS_RESOLVED = 'resolved';

    protected $fillable = [
        'citizen_id', 'matched_citizen_id', 'national_id', 'phone', 'status', 'severity',
        'remarks', 'flagged_by', 'resolved_by', 'flagged_at', 'resolved_at',
    ];

    protected $casts = [
        'flagged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function matchedCitizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'matched_citizen_id');
    }

    public function flaggedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'flagged_by');
    }
}
