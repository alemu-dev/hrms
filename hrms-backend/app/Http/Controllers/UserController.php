<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Login API (POST /api/login)
    public function login(Request $request)
    {
        $user = DB::table('users')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // ✅ Return user object with id so React can use data.user.id
        return response()->json([
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'role'    => $user->role,
            'message' => 'Login successful'
        ]);
    }

    // Create HR/Director/Admin API (POST /api/users)
    public function store(Request $request)
    {
        $existingUser = DB::table('users')->where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json(['message' => 'User with this email already exists'], 409);
        }

        $userId = DB::table('users')->insertGetId([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => $request->role,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('employee_profiles')->insert([
            'user_id'    => $userId,
            'full_name'  => $request->name,
            'department' => $request->department,
            'position'   => $request->position,
            'salary'     => $request->salary,
            'hire_date'  => now(),
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => $request->role . ' account created successfully'], 201);
    }

    // Register Employee (POST /api/employees)
    public function storeEmployee(Request $request)
    {
        $existing = DB::table('users')->where('email', $request->email)->first();
        if ($existing) {
            return response()->json(['message' => 'Employee already registered'], 409);
        }

        $userId = DB::table('users')->insertGetId([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => 'employee',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('employee_profiles')->insert([
            'user_id'    => $userId,
            'full_name'  => $request->name,
            'department' => $request->department,
            'position'   => $request->position,
            'salary'     => $request->salary,
            'hire_date'  => now(),
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Employee registered successfully'], 201);
    }

    // List all employees (GET /api/employees)
    public function listEmployees()
    {
        return response()->json(DB::table('employee_profiles')->get());
    }

    // Update employee profile (PUT /api/employees/{id})
    public function updateEmployee(Request $request, $id)
    {
        DB::table('employee_profiles')->where('id', $id)->update([
            'full_name'  => $request->name,
            'department' => $request->department,
            'position'   => $request->position,
            'salary'     => $request->salary,
            'status'     => $request->status,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Employee profile updated successfully']);
    }
}
