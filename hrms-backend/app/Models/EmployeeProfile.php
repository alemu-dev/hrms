<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'department',
        'position',
        'gender' ,
        'salary',
        'hire_date',
        'status',
        'phone_number',
        'address',
        'date_of_birth',
    ];

    // Relationship: each employee profile belongs to one user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
