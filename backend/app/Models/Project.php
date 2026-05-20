<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'client_name',
        'start_date',
        'end_date',
        'location_id',
        'status',
        'budget',
        'spent_amount',
        'budget_currency',
        'budget_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'spent_amount' => 'decimal:2',
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function milestones()
    {
        return $this->hasMany(Milestone::class);
    }

    public function getRemainingBudgetAttribute()
    {
        return $this->budget - $this->spent_amount;
    }

    public function getBudgetUtilizationPercentageAttribute()
    {
        if ($this->budget > 0) {
            return round(($this->spent_amount / $this->budget) * 100, 2);
        }
        return 0;
    }
}
