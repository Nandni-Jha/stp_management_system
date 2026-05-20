<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'address',
        'latitude',
        'longitude',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class, 'current_location_id');
    }
}
