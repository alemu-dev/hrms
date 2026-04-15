<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $table = 'employee_profiles'; // ✅ IMPORTANT (your table name)

    protected $fillable = [
        'user_id',
        'full_name',
        'department',
        'position',
        'position_number',
        'grade',
        'step',
        'gender',
        'salary',
        'hire_date',
        'status',
        'phone_number',
        'address',

        // 🔥 NEW FIELDS
        'photo',
        'national_id'
    ];

    /**
     * ===============================
     * 🔗 RELATIONSHIP
     * ===============================
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ===============================
     * 🖼 GET PHOTO URL
     * ===============================
     */
    public function getPhotoUrlAttribute()
    {
        return $this->photo 
            ? url('storage/' . $this->photo) 
            : null;
    }

    /**
     * ===============================
     * 🆔 GET NATIONAL ID URL
     * ===============================
     */
    public function getNationalIdUrlAttribute()
    {
        return $this->national_id 
            ? url('storage/' . $this->national_id) 
            : null;
    }
}