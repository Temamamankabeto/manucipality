<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneralAsset extends Model
{
    use HasFactory;

    protected $fillable = [

        'asset_type_id',
        'asset_group_id',
        'asset_subgroup_id',

        'asset_code',
        'asset_name',

        'location',

        'condition',
        'working_status',

        'size',
        'size_unit',

        'construction_year',

        'estimated_value',

        'department_id',

        'status',

        'description'
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function assetType()
    {
        return $this->belongsTo(
            AssetType::class
        );
    }

    public function assetGroup()
    {
        return $this->belongsTo(
            AssetGroup::class
        );
    }

    public function assetSubgroup()
    {
        return $this->belongsTo(
            AssetSubgroup::class
        );
    }

    public function department()
    {
        return $this->belongsTo(
            Department::class
        );
    }

    public function inspections()
    {
        return $this->hasMany(
            GeneralAssetInspection::class
        );
    }

    public function maintenances()
    {
        return $this->hasMany(
            GeneralAssetMaintenance::class
        );
    }
}