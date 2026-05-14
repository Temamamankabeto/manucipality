<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenUniqueId extends Model
{
    use HasFactory;

    protected $fillable = ['citizen_id', 'citizen_uid', 'generated_by', 'generated_at'];

    protected $casts = ['generated_at' => 'datetime'];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
