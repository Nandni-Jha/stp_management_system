<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function assetCategories()
    {
        return $this->hasMany(AssetCategory::class);
    }

    public function assets()
    {
        return $this->hasManyThrough(Asset::class, AssetCategory::class);
    }
}
