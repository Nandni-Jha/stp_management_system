<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Operator extends Model
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name',
        'employee_id',
        'job_title',
        'department',
        'license_number',
        'license_type',
        'license_issue_date',
        'license_expiry',
        'phone',
        'email',
        'password',
        'status',
        'address',
        'emergency_contact',
        'skills',
        'about_me',
        'hire_date',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function assetUsageLogs()
    {
        return $this->hasMany(AssetUsageLog::class);
    }
}
