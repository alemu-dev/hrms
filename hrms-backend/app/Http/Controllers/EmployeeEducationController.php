<?php

namespace App\Http\Controllers;

use App\Models\EmployeeEducation;
use Illuminate\Http\Request;

class EmployeeEducationController extends Controller
{
    // Create new education record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'level' => 'nullable|string',
            'field' => 'nullable|string',
            'institution' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $education = EmployeeEducation::create($validated);

        return response()->json($education, 201);
    }

    // List all education records
    public function all()
    {
        return EmployeeEducation::all();
    }

    // List education records for a specific user
    public function index($userId)
    {
        return EmployeeEducation::where('user_id', $userId)->get();
    }
}
