<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'tax_bill_id',
        'tax_assessment_id',
        'citizen_id',
        'amount_paid',
        'payment_method',
        'reference_number',
        'status',
        'collected_by',
        'verified_by',
        'paid_at',
        'verified_at',
        'verification_note',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'paid_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(TaxBill::class, 'tax_bill_id');
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(TaxAssessment::class, 'tax_assessment_id');
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(PaymentReceipt::class, 'tax_payment_id');
    }
}
