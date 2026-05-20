<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'operator_id',
        'project_id',
        'assigned_from',
        'assigned_to',
        'usage_type',
    ];

    protected $casts = [
        'assigned_from' => 'datetime',
        'assigned_to' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
