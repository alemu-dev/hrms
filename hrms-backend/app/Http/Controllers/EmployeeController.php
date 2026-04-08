<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmployeeProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    /**
     * Get Stats for the Director Dashboard
     */
    public function getStats() 
    {
        // 1. Group by Education Level
        $education = DB::table('employee_education')
            ->select(DB::raw('UPPER(level) as name'), DB::raw('count(*) as value'))
            ->whereNotNull('level')
            ->where('level', '!=', '')
            ->groupBy(DB::raw('UPPER(level)'))
            ->get();

        // 2. Group by Department
        $departments = DB::table('employee_profiles')
            ->select('department as name', DB::raw('count(*) as value'))
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->groupBy('department')
            ->get();

        // 3. Group by Gender (Updated to ensure clean names)
        $gender = DB::table('employee_profiles')
            ->select('gender as name', DB::raw('count(*) as value'))
            ->whereNotNull('gender')
            ->where('gender', '!=', '')
            ->groupBy('gender')
            ->get();

        // 4. Summary Statistics
        $totalEmployees = DB::table('employee_profiles')->count();
        $totalSalary = DB::table('employee_profiles')->sum('salary');
        $avgSalary = DB::table('employee_profiles')->avg('salary');

        return response()->json([
            'education' => $education,
            'departments' => $departments,
            'gender' => $gender,
            'summary' => [
                'total_staff' => $totalEmployees,
                'total_budget' => round($totalSalary, 2),
                'avg_salary' => round($avgSalary, 2),
                'active_depts' => $departments->count()
            ]
        ]);
    }

    // List all employees
    public function index()
    {
        return response()->json(
            EmployeeProfile::with([
                'user.biography',
                'user.education',
                'user.experience',
                'user.documents'
            ])->get()
        );
    }

    // Show single employee
    public function show($id)
    {
        $employee = EmployeeProfile::with([
            'user.biography',
            'user.education',
            'user.experience',
            'user.documents'
        ])->findOrFail($id);

        return response()->json($employee);
    }

    // Show employee profile by user_id
    public function showByUser($userId)
    {
        $employee = EmployeeProfile::with([
            'user.biography',
            'user.education',
            'user.experience',
            'user.documents'
        ])
        ->where('user_id', $userId)
        ->firstOrFail();

        return response()->json($employee);
    }

    // Create new employee
    public function store(Request $request)
    {
        $validatedUser = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $validatedProfile = $request->validate([
            'full_name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'salary' => 'required|numeric',
            'gender' => 'required|string', // ✅ Handled
            'hire_date' => 'nullable|date',
            'status' => 'required|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($validatedUser, $validatedProfile, $request) {
            $user = User::create([
                'name' => $validatedUser['name'],
                'email' => $validatedUser['email'],
                'password' => Hash::make($validatedUser['password']),
                'role' => 'employee',
            ]);

            $employee = EmployeeProfile::create(array_merge($validatedProfile, [
                'user_id' => $user->id,
            ]));

            if ($request->has('education')) {
                $user->education()->createMany($request->education);
            }
            if ($request->has('experience')) {
                $user->experience()->createMany($request->experience);
            }
            if ($request->has('biography')) {
                $user->biography()->create(['bio_text' => $request->biography['bio_text'] ?? '']);
            }
            if ($request->has('documents')) {
                $user->documents()->createMany($request->documents);
            }

            return response()->json([
                'message' => 'Employee created successfully',
                'user' => $user,
                'employee' => $employee
            ], 201);
        });
    }

    // Update employee
    public function update(Request $request, $id)
    {
        $employee = EmployeeProfile::findOrFail($id);
        $user = $employee->user;

        $validatedUser = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
        ]);

        $validatedProfile = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'salary' => 'sometimes|numeric',
            'gender' => 'sometimes|string', // ✅ Handled
            'hire_date' => 'nullable|date',
            'status' => 'sometimes|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($user, $employee, $validatedUser, $validatedProfile, $request) {
            $user->update([
                'name' => $validatedUser['name'] ?? $user->name,
                'email' => $validatedUser['email'] ?? $user->email,
                'password' => !empty($validatedUser['password'])
                    ? Hash::make($validatedUser['password'])
                    : $user->password,
            ]);

            $employee->update($validatedProfile);

            if ($request->has('education')) {
                $user->education()->delete();
                $user->education()->createMany($request->education);
            }

            if ($request->has('experience')) {
                $user->experience()->delete();
                $user->experience()->createMany($request->experience);
            }

            if ($request->has('biography')) {
                $user->biography()->updateOrCreate(
                    ['user_id' => $user->id],
                    ['bio_text' => $request->biography['bio_text'] ?? '']
                );
            }

            if ($request->has('documents')) {
                $user->documents()->delete();
                $user->documents()->createMany($request->documents);
            }

            return response()->json([
                'message' => 'Employee updated successfully',
                'user' => $user,
                'employee' => $employee
            ]);
        });
    }

    public function destroy($id)
    {
        $employee = EmployeeProfile::findOrFail($id);
        $user = $employee->user;

        $employee->delete();
        $user->delete();

        return response()->json([
            'message' => 'Employee deleted successfully'
        ]);
    }
}