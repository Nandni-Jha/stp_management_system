<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'target_date',
        'actual_date',
        'status',
    ];

    protected $casts = [
        'target_date' => 'date',
        'actual_date' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }


    // Budget category methods
    public function getBudgetTotalAttribute()
    {
        return $this->budgets->sum('amount');
    }

    public function getSpentTotalAttribute()
    {
        return $this->expenses->sum('amount');
    }

    public function getRemainingTotalAttribute()
    {
        return $this->budgetTotal - $this->spentTotal;
    }

    public function getBudgetUtilizationPercentageAttribute()
    {
        if ($this->budgetTotal > 0) {
            return round(($this->spentTotal / $this->budgetTotal) * 100, 2);
        }
        return 0;
    }

    // Category-specific methods
    public function getBudgetMaterialAttribute()
    {
        return $this->budgets->where('category', 'material')->sum('amount');
    }

    public function getBudgetLabourAttribute()
    {
        return $this->budgets->where('category', 'labour')->sum('amount');
    }

    public function getBudgetSubContractorAttribute()
    {
        return $this->budgets->where('category', 'sub_contractor')->sum('amount');
    }

    public function getBudgetEquipmentAttribute()
    {
        return $this->budgets->where('category', 'equipment')->sum('amount');
    }

    public function getSpentMaterialAttribute()
    {
        return $this->expenses->where('category', 'material')->sum('amount');
    }

    public function getSpentLabourAttribute()
    {
        return $this->expenses->where('category', 'labour')->sum('amount');
    }

    public function getSpentSubContractorAttribute()
    {
        return $this->expenses->where('category', 'sub_contractor')->sum('amount');
    }

    public function getSpentEquipmentAttribute()
    {
        return $this->expenses->where('category', 'equipment')->sum('amount');
    }

    public function getRemainingMaterialAttribute()
    {
        return $this->budgetMaterial - $this->spentMaterial;
    }

    public function getRemainingLabourAttribute()
    {
        return $this->budgetLabour - $this->spentLabour;
    }

    public function getRemainingSubContractorAttribute()
    {
        return $this->budgetSubContractor - $this->spentSubContractor;
    }

    public function getRemainingEquipmentAttribute()
    {
        return $this->budgetEquipment - $this->spentEquipment;
    }

    public function getMaterialUtilizationPercentageAttribute()
    {
        if ($this->budgetMaterial > 0) {
            return round(($this->spentMaterial / $this->budgetMaterial) * 100, 2);
        }
        return 0;
    }

    public function getLabourUtilizationPercentageAttribute()
    {
        if ($this->budgetLabour > 0) {
            return round(($this->spentLabour / $this->budgetLabour) * 100, 2);
        }
        return 0;
    }

    public function getSubContractorUtilizationPercentageAttribute()
    {
        if ($this->budgetSubContractor > 0) {
            return round(($this->spentSubContractor / $this->budgetSubContractor) * 100, 2);
        }
        return 0;
    }

    public function getEquipmentUtilizationPercentageAttribute()
    {
        if ($this->budgetEquipment > 0) {
            return round(($this->spentEquipment / $this->budgetEquipment) * 100, 2);
        }
        return 0;
    }


    public function getDaysUntilTargetAttribute()
    {
        return now()->diffInDays($this->target_date, false);
    }

    public function getIsOverdueAttribute()
    {
        return $this->target_date < now() && $this->status !== 'completed';
    }
}
