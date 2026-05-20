<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'contact_details',
    ];

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class, 'vendor');
    }
}
