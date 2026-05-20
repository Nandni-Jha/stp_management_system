<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'document_type',
        'document_number',
        'expiry_date',
        'file_path',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
