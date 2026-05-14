<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id', 'stage', 'action', 'from_status', 'to_status', 'remarks',
        'decided_by', 'decided_at', 'metadata',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
