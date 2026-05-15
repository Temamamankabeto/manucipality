<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetDisposal extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Asset Reference
        */
        'asset_id',

        /*
        Disposal Information
        */
        'disposal_number',
        'disposal_date',
        'reason',

        /*
        Inspection Result
        */
        'inspection_result',

        /*
        Technical Expert
        */
        'inspected_by',

        /*
        Committee Decision
        */
        'committee_decision',

        /*
        Regional Approval
        */
        'regional_approval',

        /*
        Auction Status
        */
        'auction_status',

        /*
        Revenue
        */
        'revenue_amount',

        /*
        Remarks
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

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function assetAuctions()
    {
        return $this->hasMany(AssetAuction::class);
    }
}