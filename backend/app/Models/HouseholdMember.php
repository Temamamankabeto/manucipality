<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class HouseholdMember extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    public const RELATIONSHIP_HEAD = 'head';
    public const RELATIONSHIP_SPOUSE = 'spouse';
    public const RELATIONSHIP_CHILD = 'child';
    public const RELATIONSHIP_PARENT = 'parent';
    public const RELATIONSHIP_SIBLING = 'sibling';
    public const RELATIONSHIP_DEPENDENT = 'dependent';
    public const RELATIONSHIP_OTHER = 'other';

    protected $fillable = [
        'household_id',
        'citizen_id',
        'relationship',
        'is_head',
        'is_dependent',
        'joined_at',
        'left_at',
        'status',
        'added_by',
    ];

    protected $casts = [
        'is_head' => 'boolean',
        'is_dependent' => 'boolean',
        'joined_at' => 'date',
        'left_at' => 'date',
    ];

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
