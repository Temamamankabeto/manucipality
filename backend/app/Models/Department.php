<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [

        'name',
        'code',
        'parent_department_id',
        'head_user_id',
        'phone',
        'email',
        'location',
        'department_type',
        'status',
        'description'
    ];

    /*
    |--------------------------------------------------------------------------
    | Parent Department
    |--------------------------------------------------------------------------
    */

    public function parentDepartment()
    {
        return $this->belongsTo(
            Department::class,
            'parent_department_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Child Departments
    |--------------------------------------------------------------------------
    */

    public function childDepartments()
    {
        return $this->hasMany(
            Department::class,
            'parent_department_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Department Head
    |--------------------------------------------------------------------------
    */

    public function head()
    {
        return $this->belongsTo(
            User::class,
            'head_user_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Assets
    |--------------------------------------------------------------------------
    */

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Asset Requests
    |--------------------------------------------------------------------------
    */

    public function assetRequests()
    {
        return $this->hasMany(AssetRequest::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Transfers From
    |--------------------------------------------------------------------------
    */

    public function transferFrom()
    {
        return $this->hasMany(
            AssetTransfer::class,
            'from_department_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Transfers To
    |--------------------------------------------------------------------------
    */

    public function transferTo()
    {
        return $this->hasMany(
            AssetTransfer::class,
            'to_department_id'
        );
    }
}