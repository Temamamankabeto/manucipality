<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Asset Reference
        */
        'asset_id',

        /*
        Maintenance Information
        */
        'maintenance_date',
        'problem_description',
        'maintenance_action',

        /*
        Cost
        */
        'maintenance_cost',

        /*
        Maintenance By
        */
        'maintained_by',

        /*
        Status
        */
        'status',

        /*
        Remark
        */
        'remark',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function maintainedBy()
    {
        return $this->belongsTo(User::class, 'maintained_by');
    }
}