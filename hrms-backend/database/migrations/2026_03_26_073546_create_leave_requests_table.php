<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'leave_requests'; // 👈 matches your migration table

    protected $fillable = [
        'employee_id',
        'type',
        'start_date',
        'end_date',
        'status',
    ];
}
