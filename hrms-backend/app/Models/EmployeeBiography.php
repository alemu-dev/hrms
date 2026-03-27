<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeBiography extends Model
{
    use HasFactory;

    protected $table = 'employee_biography';

    protected $fillable = [
        'user_id',
        'bio_text',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
