<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_type_id',
        'name',
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

    public function assetSubgroups()
    {
        return $this->hasMany(AssetSubgroup::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}