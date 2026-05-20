<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_code',
        'asset_type_id',
        'category_id',
        'name',
        'brand',
        'model',
        'year',
        'serial_number',
        'registration_number',
        'purchase_date',
        'purchase_cost',
        'status',
        'current_location_id',
        'engine_type',
        'engine_capacity',
        'fuel_capacity',
        'load_capacity',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'year' => 'integer',
        'purchase_cost' => 'decimal:2',
    ];

    public function assetType()
    {
        return $this->belongsTo(AssetType::class);
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function currentLocation()
    {
        return $this->belongsTo(Location::class, 'current_location_id');
    }

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class);
    }

    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function assetUsageLogs()
    {
        return $this->hasMany(AssetUsageLog::class);
    }

    public function assetDocuments()
    {
        return $this->hasMany(AssetDocument::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }
}
