<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'property_valuation_id',
        'tax_type_id',
        'assessment_year',
        'assessed_value',
        'tax_rate',
        'tax_amount',
        'penalty_amount',
        'total_amount',
        'status',
        'due_date',
        'paid_at',
    ];

    protected $casts = [
        'assessed_value' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function valuation(): BelongsTo
    {
        return $this->belongsTo(PropertyValuation::class, 'property_valuation_id');
    }

    public function taxType(): BelongsTo
    {
        return $this->belongsTo(TaxType::class);
    }
}
