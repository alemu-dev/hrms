<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeExperience extends Model
{
    use HasFactory;

    protected $table = 'employee_experience';

    protected $fillable = [
        'user_id',
        'company',
        'role',
        'start_date',
        'end_date',
        'responsibilities',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
