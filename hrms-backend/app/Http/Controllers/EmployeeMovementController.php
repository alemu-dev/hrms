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

            // ✅ FIXED (removed timezone problem)
            'effective_date'      => 'required|date',

            'approved_by'         => 'nullable|string|max:255',
            'remarks'             => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($validated) {

            // ✅ Normalize empty strings → null
            $movementData = $this->normalizeData($validated);

            $movement = EmployeeMovement::create($movementData);

            // Update employee profile
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

        return DB::transaction(function () use ($movement, $validated) {

            // ✅ Normalize empty strings → null
            $movementData = $this->normalizeData($validated);

            $movement->update($movementData);

            $this->updateEmployeeProfile($movementData);

            return response()->json([
                'message' => 'Movement updated successfully',
                'data'    => $movement->fresh()->load('employee')
            ]);
        });
    }

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
     * Normalize empty strings to null
     */
    private function normalizeData(array $data): array
    {
        foreach ($data as $key => $value) {
            if ($value === '') {
                $data[$key] = null;
            }
        }
        return $data;
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
            if (
                array_key_exists($dataKey, $data) &&
                $data[$dataKey] !== null
            ) {
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