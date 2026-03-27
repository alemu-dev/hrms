<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',   // added so you can set user roles
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // 🔹 Relationships

    // Each user has one employee profile
    public function employeeProfile()
    {
        return $this->hasOne(EmployeeProfile::class);
    }

    // Each user has one biography
    public function biography()
    {
        return $this->hasOne(EmployeeBiography::class);
    }

    // Each user can have many education records
    public function education()
    {
        return $this->hasMany(EmployeeEducation::class);
    }

    // Each user can have many experience records
    public function experience()
    {
        return $this->hasMany(EmployeeExperience::class);
    }

    // Each user can have many documents
    public function documents()
    {
        return $this->hasMany(EmployeeDocument::class);
    }
}
