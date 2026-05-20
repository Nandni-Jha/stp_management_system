<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaborCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'hour_rate',
        'day_rate',
    ];

    protected $casts = [
        'hour_rate' => 'decimal:2',
        'day_rate'  => 'decimal:2',
    ];

    public function labors()
    {
        return $this->hasMany(Labor::class);
    }
}
