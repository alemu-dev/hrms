<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmployeeProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    // List all employees with full user + related data
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

    // Show single employee by profile ID
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

    // Show employee profile by user_id (for EmployeeWorkspace)
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

    // Create new employee (user + profile)
    public function store(Request $request)
    {
        // Validate user fields
        $validatedUser = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string'
        ]);

        // Validate profile fields
        $validatedProfile = $request->validate([
            'full_name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'salary' => 'required|numeric',
            'hire_date' => 'nullable|date',
            'status' => 'required|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        // Create user
        $user = User::create([
            'name' => $validatedUser['name'],
            'email' => $validatedUser['email'],
            'password' => Hash::make($validatedUser['password']),
            'role' => $validatedUser['role'],
        ]);

        // Create employee profile linked to user
        $employee = EmployeeProfile::create(array_merge($validatedProfile, [
            'user_id' => $user->id,
        ]));

        return response()->json([
            'message' => 'Employee created successfully',
            'user' => $user,
            'employee' => $employee
        ], 201);
    }

    // Update employee (user + profile)
    public function update(Request $request, $id)
    {
        $employee = EmployeeProfile::findOrFail($id);
        $user = $employee->user;

        $validatedUser = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|string'
        ]);

        $validatedProfile = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'salary' => 'sometimes|numeric',
            'hire_date' => 'nullable|date',
            'status' => 'sometimes|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        // Update user
        $user->update([
            'name' => $validatedUser['name'] ?? $user->name,
            'email' => $validatedUser['email'] ?? $user->email,
            'role' => $validatedUser['role'] ?? $user->role,
            'password' => !empty($validatedUser['password'])
                ? Hash::make($validatedUser['password'])
                : $user->password,
        ]);

        // Update employee profile
        $employee->update($validatedProfile);

        return response()->json([
            'message' => 'Employee updated successfully',
            'user' => $user,
            'employee' => $employee
        ]);
    }

    // Delete employee (profile + user)
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
