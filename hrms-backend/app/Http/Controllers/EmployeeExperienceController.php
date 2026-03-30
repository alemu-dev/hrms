<?php

namespace App\Http\Controllers;

use App\Models\EmployeeExperience;
use Illuminate\Http\Request;

class EmployeeExperienceController extends Controller
{
    // Create new experience record
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

    // List all experience records
    public function all()
    {
        return EmployeeExperience::all();
    }

    // List experience records for a specific user
    public function index($userId)
    {
        return EmployeeExperience::where('user_id', $userId)->get();
    }

    // ✅ Update an experience record
    public function update(Request $request, $id)
    {
        $experience = EmployeeExperience::findOrFail($id);

        $validated = $request->validate([
            'company' => 'nullable|string',
            'role' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'responsibilities' => 'nullable|string',
        ]);

        $experience->update($validated);

        return response()->json([
            'message' => 'Experience record updated successfully',
            'data' => $experience
        ]);
    }

    // ✅ Delete an experience record
    public function destroy($id)
    {
        $experience = EmployeeExperience::findOrFail($id);
        $experience->delete();

        return response()->json([
            'message' => 'Experience record deleted successfully'
        ]);
    }
}
