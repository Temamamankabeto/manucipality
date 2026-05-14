<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'sanctum';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'profile_image',
        'password',
        'is_active',
        'address',
        'office_id',
        'admin_level',
        'last_login_at',
        'refresh_token',
        'refresh_token_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'refresh_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'refresh_token_expires_at' => 'datetime',
    ];

    protected $appends = ['profile_image_url'];

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function registeredCitizens()
    {
        return $this->hasMany(Citizen::class, 'registered_by');
    }

    public function getProfileImageUrlAttribute(): ?string
    {
        return $this->profile_image ? asset('storage/' . $this->profile_image) : null;
    }

    // Legacy relationships kept for compatibility with old screens during migration.
    public function createdOrders()
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    public function waiterOrders()
    {
        return $this->hasMany(Order::class, 'waiter_id');
    }

    public function kitchenTickets()
    {
        return $this->hasMany(KitchenTicket::class, 'chef_id');
    }

    public function barTickets()
    {
        return $this->hasMany(BarTicket::class, 'barman_id');
    }

    public function issuedBills()
    {
        return $this->hasMany(Bill::class, 'issued_by');
    }

    public function receivedPayments()
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function cashShifts()
    {
        return $this->hasMany(CashShift::class, 'cashier_id');
    }

    public function tables()
    {
        return $this->hasMany(DiningTable::class, 'assigned_waiter_id');
    }
}
