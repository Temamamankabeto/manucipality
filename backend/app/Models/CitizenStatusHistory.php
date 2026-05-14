<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'from_status',
        'to_status',
        'reason',
        'changed_by',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
