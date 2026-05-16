<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_category_id',
        'property_number',
        'title',
        'property_type',
        'area_size',
        'area_unit',
        'latitude',
        'longitude',
        'address',
        'city_id',
        'subcity_id',
        'woreda_id',
        'status',
    ];

    protected $casts = [
        'area_size' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(PropertyCategory::class, 'property_category_id');
    }

    public function citizens(): BelongsToMany
    {
        return $this->belongsToMany(Citizen::class, 'citizen_properties')
            ->withPivot([
                'ownership_type',
                'ownership_start_date',
                'ownership_end_date',
                'is_active',
            ])
            ->withTimestamps();
    }
}
