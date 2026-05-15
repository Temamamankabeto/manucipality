<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetIssue extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        Related Request
        */
        'asset_request_id',
        'asset_id',

        /*
        Issue Information
        */
        'issue_number',
        'quantity',
        'issue_date',

        /*
        Users
        */
        'issued_to',
        'issued_by',
        'approved_by',

        /*
        Workflow Status
        */
        'status',

        /*
        Purpose
        */
        'purpose',

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

    public function assetRequest()
    {
        return $this->belongsTo(AssetRequest::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function issuedTo()
    {
        return $this->belongsTo(User::class, 'issued_to');
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}