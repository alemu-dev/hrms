<?php

namespace App\Http\Controllers;

use App\Models\EmployeeBiography;
use Illuminate\Http\Request;

class EmployeeBiographyController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:employee_biography,user_id',
            'bio_text' => 'nullable|string',
        ]);

        $biography = EmployeeBiography::create($validated);

        return response()->json($biography, 201);
    }

    public function all()
    {
        return EmployeeBiography::all();
    }

    public function show($userId)
    {
        return EmployeeBiography::where('user_id', $userId)->first();
    }
}
