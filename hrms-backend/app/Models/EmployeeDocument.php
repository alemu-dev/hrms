<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDocument extends Model
{
    use HasFactory;

    // Make sure this matches your migration table name
    protected $table = 'employee_documents';

    protected $fillable = [
        'user_id',
        'document_type',
        'file_path',
        'uploaded_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
