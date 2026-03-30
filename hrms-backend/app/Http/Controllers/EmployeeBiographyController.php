<?php

namespace App\Http\Controllers;

use App\Models\EmployeeBiography;
use Illuminate\Http\Request;

class EmployeeBiographyController extends Controller
{
    // Create new biography record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:employee_biography,user_id',
            'bio_text' => 'nullable|string',
        ]);

        $biography = EmployeeBiography::create($validated);

        return response()->json($biography, 201);
    }

    // List all biographies
    public function all()
    {
        return EmployeeBiography::all();
    }

    // Show biography for a specific user
    public function show($userId)
    {
        return EmployeeBiography::where('user_id', $userId)->first();
    }

    // ✅ Update a biography record
    public function update(Request $request, $id)
    {
        $biography = EmployeeBiography::findOrFail($id);

        $validated = $request->validate([
            'bio_text' => 'nullable|string',
        ]);

        $biography->update($validated);

        return response()->json([
            'message' => 'Biography updated successfully',
            'data' => $biography
        ]);
    }

    // ✅ Delete a biography record
    public function destroy($id)
    {
        $biography = EmployeeBiography::findOrFail($id);
        $biography->delete();

        return response()->json([
            'message' => 'Biography deleted successfully'
        ]);
    }
}
