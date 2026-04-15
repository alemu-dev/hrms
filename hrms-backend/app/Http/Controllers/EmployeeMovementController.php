<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\EmployeeMovement;
use App\Models\EmployeeProfile;

class EmployeeMovementController extends Controller
{
    /**
     * Store a new employee movement
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'     => 'required|exists:employee_profiles,id',
            'type'            => 'required|in:step_increment,grade_increment,promotion',
            'old_position'    => 'nullable|string',
            'new_position'    => 'nullable|string',
            'old_grade'       => 'nullable|string',
            'new_grade'       => 'nullable|string',
            'old_step'        => 'nullable|numeric',
            'new_step'        => 'nullable|numeric',
            'old_salary'      => 'nullable|numeric',
            'new_salary'      => 'nullable|numeric',
            'effective_date'  => 'required|date',
            'approved_by'     => 'nullable|string',
            'remarks'         => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {

            $movement = EmployeeMovement::create($validated);

            // 🔥 update employee
            $this->updateEmployeeProfile($validated);

            return response()->json([
                'message' => 'Movement recorded successfully',
                'data' => $movement
            ], 201);
        });
    }

    /**
     * ✅ FIXED: Get movements (OPTIONAL FILTER)
     */
    public function index(Request $request)
    {
        $query = EmployeeMovement::with('employee')->latest();

        // 🔥 ONLY THIS LINE FIXES YOUR PROBLEM
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        return response()->json($query->get());
    }

    /**
     * Get single movement
     */
    public function show($id)
    {
        $movement = EmployeeMovement::with('employee')->findOrFail($id);
        return response()->json($movement);
    }

    /**
     * Update movement
     */
    public function update(Request $request, $id)
    {
        $movement = EmployeeMovement::findOrFail($id);

        $validated = $request->validate([
            'employee_id'     => 'required|exists:employee_profiles,id',
            'type'            => 'required|in:step_increment,grade_increment,promotion',
            'old_position'    => 'nullable|string',
            'new_position'    => 'nullable|string',
            'old_grade'       => 'nullable|string',
            'new_grade'       => 'nullable|string',
            'old_step'        => 'nullable|numeric',
            'new_step'        => 'nullable|numeric',
            'old_salary'      => 'nullable|numeric',
            'new_salary'      => 'nullable|numeric',
            'effective_date'  => 'required|date',
            'approved_by'     => 'nullable|string',
            'remarks'         => 'nullable|string',
        ]);

        return DB::transaction(function () use ($movement, $validated) {

            $movement->update($validated);

            $this->updateEmployeeProfile($validated);

            return response()->json([
                'message' => 'Movement updated successfully',
                'data' => $movement
            ]);
        });
    }

    /**
     * Delete movement
     */
    public function destroy($id)
    {
        $movement = EmployeeMovement::findOrFail($id);
        $movement->delete();

        return response()->json([
            'message' => 'Movement deleted successfully'
        ]);
    }

    /**
     * Update employee safely
     */
    private function updateEmployeeProfile($data)
    {
        $employee = EmployeeProfile::find($data['employee_id']);

        if (!$employee) return;

        if (array_key_exists('new_position', $data) && $data['new_position'] !== '') {
            $employee->position = $data['new_position'];
        }

        if (array_key_exists('new_salary', $data) && $data['new_salary'] !== '') {
            $employee->salary = (float) $data['new_salary'];
        }

        if (array_key_exists('new_grade', $data) && $data['new_grade'] !== '') {
            $employee->grade = $data['new_grade'];
        }

        if (array_key_exists('new_step', $data) && $data['new_step'] !== '') {
            $employee->step = (int) $data['new_step'];
        }

        $employee->save();
    }
}