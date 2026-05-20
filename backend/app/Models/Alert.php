<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'alert_type',
        'message',
        'trigger_date',
        'status',
    ];

    protected $casts = [
        'trigger_date' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
