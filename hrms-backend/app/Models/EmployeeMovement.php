<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeMovement extends Model
{
    use HasFactory;

    protected $table = 'employee_movements';

    protected $fillable = [
    'employee_id',
    'type',
    'old_department',  // Ensure this is here
    'new_department',  // Ensure this is here
    'old_position',
    'old_position_number',
    'new_position',
    'new_position_number',
    'old_grade',
    'new_grade',
    'old_step',
    'new_step',
    'old_salary',
    'new_salary',
    'effective_date',
    'approved_by',
    'remarks',
];

    /**
     * Relationship with EmployeeProfile
     */
    public function employee()
    {
        return $this->belongsTo(EmployeeProfile::class, 'employee_id');
    }
}