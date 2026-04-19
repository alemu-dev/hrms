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
            'employee_id'         => 'required|exists:employee_profiles,id',
            'type'                => 'required|in:step_increment,grade_increment,promotion',

            'old_position'        => 'nullable|string|max:255',
            'new_position'        => 'nullable|string|max:255',

            'old_position_number' => 'nullable|string|max:100',
            'new_position_number' => 'nullable|string|max:100',

            'old_department'      => 'nullable|string|max:255',
            'new_department'      => 'nullable|string|max:255',

            'old_grade'           => 'nullable|string|max:50',
            'new_grade'           => 'nullable|string|max:50',

            'old_step'            => 'nullable|integer|min:0',
            'new_step'            => 'nullable|integer|min:0',

            'old_salary'          => 'nullable|numeric|min:0',
            'new_salary'          => 'nullable|numeric|min:0',

            'effective_date'      => 'required|date|after_or_equal:today',
            'approved_by'         => 'nullable|string|max:255',
            'remarks'             => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Use all input instead of only validated to ensure every sent field is considered
            $data = $request->all();   // This gets new_position_number even if it's empty string

            // Merge validated rules with raw input (safer than $validated alone)
            $movementData = array_merge($validated, [
                'new_position_number' => $data['new_position_number'] ?? null,
                'new_position'        => $data['new_position'] ?? null,
                'new_department'      => $data['new_department'] ?? null,
                'new_grade'           => $data['new_grade'] ?? null,
                'new_step'            => $data['new_step'] ?? null,
                'new_salary'          => $data['new_salary'] ?? null,
            ]);

            $movement = EmployeeMovement::create($movementData);

            // Update employee profile with new values
            $this->updateEmployeeProfile($movementData);

            return response()->json([
                'message' => 'Employee movement recorded successfully',
                'data'    => $movement->load('employee')
            ], 201);
        });
    }

    /**
     * Update an existing movement
     */
    public function update(Request $request, $id)
    {
        $movement = EmployeeMovement::findOrFail($id);

        $validated = $request->validate([
            'employee_id'         => 'required|exists:employee_profiles,id',
            'type'                => 'required|in:step_increment,grade_increment,promotion',

            'old_position'        => 'nullable|string|max:255',
            'new_position'        => 'nullable|string|max:255',

            'old_position_number' => 'nullable|string|max:100',
            'new_position_number' => 'nullable|string|max:100',

            'old_department'      => 'nullable|string|max:255',
            'new_department'      => 'nullable|string|max:255',

            'old_grade'           => 'nullable|string|max:50',
            'new_grade'           => 'nullable|string|max:50',

            'old_step'            => 'nullable|integer|min:0',
            'new_step'            => 'nullable|integer|min:0',

            'old_salary'          => 'nullable|numeric|min:0',
            'new_salary'          => 'nullable|numeric|min:0',

            'effective_date'      => 'required|date',
            'approved_by'         => 'nullable|string|max:255',
            'remarks'             => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($movement, $validated, $request) {
            $data = $request->all();

            $movementData = array_merge($validated, [
                'new_position_number' => $data['new_position_number'] ?? null,
                'new_position'        => $data['new_position'] ?? null,
                'new_department'      => $data['new_department'] ?? null,
                'new_grade'           => $data['new_grade'] ?? null,
                'new_step'            => $data['new_step'] ?? null,
                'new_salary'          => $data['new_salary'] ?? null,
            ]);

            $movement->update($movementData);
            $this->updateEmployeeProfile($movementData);

            return response()->json([
                'message' => 'Movement updated successfully',
                'data'    => $movement->fresh()->load('employee')
            ]);
        });
    }

    // index, show, destroy methods remain unchanged
    public function index(Request $request)
    {
        $query = EmployeeMovement::with('employee')->latest();

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $movement = EmployeeMovement::with('employee')->findOrFail($id);
        return response()->json($movement);
    }

    public function destroy($id)
    {
        $movement = EmployeeMovement::findOrFail($id);
        $movement->delete();

        return response()->json(['message' => 'Movement deleted successfully']);
    }

    /**
     * Safely update the employee's current profile
     */
    private function updateEmployeeProfile(array $data): void
    {
        $employee = EmployeeProfile::find($data['employee_id']);

        if (!$employee) {
            return;
        }

        $fieldsToUpdate = [
            'position'        => 'new_position',
            'position_number' => 'new_position_number',
            'department'      => 'new_department',
            'grade'           => 'new_grade',
            'step'            => 'new_step',
            'salary'          => 'new_salary',
        ];

        foreach ($fieldsToUpdate as $employeeField => $dataKey) {
            if (array_key_exists($dataKey, $data) && $data[$dataKey] !== null && $data[$dataKey] !== '') {
                if ($employeeField === 'salary') {
                    $employee->{$employeeField} = (float) $data[$dataKey];
                } elseif ($employeeField === 'step') {
                    $employee->{$employeeField} = (int) $data[$dataKey];
                } else {
                    $employee->{$employeeField} = $data[$dataKey];
                }
            }
        }

        $employee->save();
    }
}