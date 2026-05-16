<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyValuation extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'market_value',
        'government_value',
        'valuation_date',
        'status',
        'valuator_id',
        'approved_by',
        'remarks',
        'approved_at',
    ];

    protected $casts = [
        'market_value' => 'decimal:2',
        'government_value' => 'decimal:2',
        'valuation_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function valuator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valuator_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
