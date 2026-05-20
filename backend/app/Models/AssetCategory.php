<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_type_id',
        'name',
        'description',
    ];

    public function assetType()
    {
        return $this->belongsTo(AssetType::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class, 'category_id');
    }
}
