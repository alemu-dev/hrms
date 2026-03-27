<?php

namespace App\Http\Controllers;

use App\Models\EmployeeExperience;
use Illuminate\Http\Request;

class EmployeeExperienceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'company' => 'required|string',
            'role' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'responsibilities' => 'nullable|string',
        ]);

        $experience = EmployeeExperience::create($validated);

        return response()->json($experience, 201);
    }

    public function all()
    {
        return EmployeeExperience::all();
    }

    public function index($userId)
    {
        return EmployeeExperience::where('user_id', $userId)->get();
    }
}
