<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeMovement extends Model
{
    protected $table = 'employee_movements';

    protected $fillable = [
        'employee_id',
        'type',
        'old_position',
        'new_position',
        'old_grade',
        'new_grade',
        'old_step',
        'new_step',
        'old_salary',
        'new_salary',
        'effective_date',
        'approved_by',
        'remarks'
    ];

    /**
     * Relationship: Movement belongs to EmployeeProfile
     */
    public function employee()
    {
        return $this->belongsTo(EmployeeProfile::class, 'employee_id');
    }
}