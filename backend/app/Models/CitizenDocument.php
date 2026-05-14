<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CitizenDocument extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_NATIONAL_ID = 'national_id';
    public const TYPE_BIRTH_CERTIFICATE = 'birth_certificate';
    public const TYPE_KEBELE_LETTER = 'kebele_letter';
    public const TYPE_PASSPORT_PHOTO = 'passport_photo';

    protected $fillable = [
        'citizen_id',
        'type',
        'title',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'is_required',
        'uploaded_by',
        'verified_at',
        'metadata',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'verified_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected $appends = ['file_url'];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }
}
