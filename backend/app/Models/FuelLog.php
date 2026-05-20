<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'date',
        'quantity',
        'fuel_type',
        'cost',
        'vendor_id',
        'meter_reading',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity' => 'decimal:2',
        'cost' => 'decimal:2',
        'meter_reading' => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
