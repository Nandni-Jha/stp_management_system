<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'maintenance_type_id',
        'description',
        'service_date',
        'next_due_date',
        'cost',
        'status',
    ];

    protected $casts = [
        'service_date' => 'date',
        'next_due_date' => 'date',
        'cost' => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function maintenanceType()
    {
        return $this->belongsTo(MaintenanceType::class);
    }
}
