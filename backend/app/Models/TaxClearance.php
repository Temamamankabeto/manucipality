<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxClearance extends Model
{
    use HasFactory;

    protected $fillable = [
        'clearance_number',
        'citizen_id',
        'property_id',
        'tax_assessment_id',
        'status',
        'issued_by',
        'issued_at',
        'expiry_date',
        'verification_code',
        'remarks',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'expiry_date' => 'date',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(TaxAssessment::class, 'tax_assessment_id');
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
