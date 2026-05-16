<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenProperty extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'property_id',
        'ownership_type',
        'ownership_start_date',
        'ownership_end_date',
        'is_active',
    ];

    protected $casts = [
        'ownership_start_date' => 'date',
        'ownership_end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
