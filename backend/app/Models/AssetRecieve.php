<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetReceive extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Asset Reference
        */
        'asset_id',

        /*
        Receive Information
        */
        'receive_number',
        'quantity',
        'receive_date',
        'supplier',

        /*
        Users
        */
        'received_by',
        'approved_by',

        /*
        Status
        */
        'status',

        /*
        Rejection Reason
        */
        'rejection_reason',

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

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}