<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilestoneMaterialBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'milestone_id',
        'vendor_id',
        'item',
        'amount',
    ];

    protected $casts = [
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
