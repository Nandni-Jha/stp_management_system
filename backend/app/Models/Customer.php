<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'gender',
        'age',
        'address_1',
        'address_2',
        'city',
        'state',
        'country',
        'zip',
        'status',
    ];

    protected $casts = [
        'age' => 'integer',
        'status' => 'boolean',
    ];
}
