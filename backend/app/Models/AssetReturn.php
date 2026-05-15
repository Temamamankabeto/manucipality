<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetReturn extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Related Issue
        */
        'asset_issue_id',
        'asset_id',

        /*
        Return Information
        */
        'quantity',
        'return_date',

        /*
        Users
        */
        'returned_by',
        'received_by',

        /*
        Condition
        */
        'condition',

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

    public function assetIssue()
    {
        return $this->belongsTo(AssetIssue::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function returnedBy()
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}