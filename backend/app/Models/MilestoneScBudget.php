<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilestoneScBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'milestone_id',
        'name',
        'milestone',
        'from',
        'to',
        'amount',
    ];

    protected $casts = [
        'from'   => 'date',
        'to'     => 'date',
        'amount' => 'decimal:2',
    ];

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }
}
