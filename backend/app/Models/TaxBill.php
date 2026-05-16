<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'tax_assessment_id',
        'citizen_id',
        'subtotal',
        'penalty_amount',
        'total_amount',
        'status',
        'due_date',
        'issued_at',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'due_date' => 'date',
        'issued_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(
            TaxAssessment::class,
            'tax_assessment_id'
        );
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(
            Citizen::class
        );
    }

    public function payments(): HasMany
    {
        return $this->hasMany(
            TaxPayment::class,
            'tax_bill_id'
        );
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(
            PaymentReceipt::class,
            'tax_bill_id'
        );
    }
}
