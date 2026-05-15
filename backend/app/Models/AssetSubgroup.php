<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetSubgroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_group_id',
        'name',
        'description',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function assetGroup()
    {
        return $this->belongsTo(AssetGroup::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}