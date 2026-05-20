<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetUsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'operator_id',
        'date',
        'start_meter',
        'end_meter',
        'total_usage',
        'unit',
    ];

    protected $casts = [
        'date' => 'date',
        'start_meter' => 'decimal:2',
        'end_meter' => 'decimal:2',
        'total_usage' => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class);
    }
}
