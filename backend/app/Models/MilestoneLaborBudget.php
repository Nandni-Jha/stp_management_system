<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilestoneLaborBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'milestone_id',
        'category_id',
        'type',
        'worker',
        'unit',
        'rate',
        'amount',
    ];

    protected $casts = [
        'worker' => 'integer',
        'unit'   => 'decimal:2',
        'rate'   => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }

    public function category()
    {
        return $this->belongsTo(LaborCategory::class, 'category_id');
    }
}
