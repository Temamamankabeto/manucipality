<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'address',
        'house_number',
        'city_id',
        'subcity_id',
        'woreda_id',
        'zone_id',
        'is_current',
    ];

    protected $casts = [
        'is_current' => 'boolean',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }
}
