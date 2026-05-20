<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilestoneEquipmentBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'milestone_id',
        'type',
        'vendor_id',
        'days',
        'rate',
        'amount',
    ];

    protected $casts = [
        'days' => 'integer',
        'rate' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
