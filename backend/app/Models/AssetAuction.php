<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetAuction extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Disposal Reference
        */
        'asset_disposal_id',

        /*
        Buyer Information
        */
        'buyer_name',
        'buyer_phone',
        'buyer_address',

        /*
        Auction Information
        */
        'sale_amount',
        'auction_date',

        /*
        Payment Information
        */
        'payment_status',

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

    public function assetDisposal()
    {
        return $this->belongsTo(AssetDisposal::class);
    }
}