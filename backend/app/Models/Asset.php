<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Relationships
        */
        'asset_type_id',
        'asset_group_id',
        'asset_subgroup_id',

        /*
        Asset Identification
        */
        'asset_code',
        'asset_name',
        'brand',
        'model',
        'serial_number',

        /*
        Purchase Information
        */
        'purchase_date',
        'purchase_cost',
        'supplier',

        /*
        Quantity
        */
        'quantity',
        'available_quantity',

        /*
        Asset Condition
        */
        'condition',

        /*
        Asset Status
        */
        'status',

        /*
        Working Status
        */
        'working_status',

        /*
        Location
        */
        'location',

        /*
        Department & Store Keeper
        */
        'department_id',
        'store_keeper_id',

        /*
        Description
        */
        'description',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function assetType()
    {
        return $this->belongsTo(AssetType::class);
    }

    public function assetGroup()
    {
        return $this->belongsTo(AssetGroup::class);
    }

    public function assetSubgroup()
    {
        return $this->belongsTo(AssetSubgroup::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function storeKeeper()
    {
        return $this->belongsTo(User::class, 'store_keeper_id');
    }
}