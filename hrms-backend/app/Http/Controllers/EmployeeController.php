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
     * ===============================
     * 📊 DASHBOARD STATS
     * ===============================
     */
    public function getStats() 
    {
        $education = DB::table('employee_education')
            ->select(DB::raw('UPPER(level) as name'), DB::raw('count(*) as value'))
            ->groupBy(DB::raw('UPPER(level)'))
            ->get();

        $departments = DB::table('employee_profiles')
            ->select('department as name', DB::raw('count(*) as value'))
            ->groupBy('department')
            ->get();

        $gender = DB::table('employee_profiles')
            ->select('gender as name', DB::raw('count(*) as value'))
            ->groupBy('gender')
            ->get();

        return response()->json([
            'education' => $education,
            'departments' => $departments,
            'gender' => $gender,
            'summary' => [
                'total_staff' => EmployeeProfile::count(),
                'total_budget' => round(EmployeeProfile::sum('salary'), 2),
                'avg_salary' => round(EmployeeProfile::avg('salary'), 2),
                'active_depts' => $departments->count()
            ]
        ]);
    }

    /**
     * ===============================
     * 👥 LIST EMPLOYEES
     * ===============================
     */
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

    /**
     * ===============================
     * 🔥 GET SINGLE EMPLOYEE
     * ===============================
     */
    public function show($id)
    {
        $employee = EmployeeProfile::find($id);

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        return response()->json($employee);
    }

    /**
     * ===============================
     * 🔍 FULL EMPLOYEE (BY USER)
     * ===============================
     */
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

    /**
     * ===============================
     * 🧾 REPORT
     * ===============================
     */
    public function generateReport($id)
    {
        $employee = EmployeeProfile::with([
            'user.biography',
            'user.education',
            'user.experience',
            'user.documents'
        ])->findOrFail($id);

        $movements = DB::table('employee_movements')
            ->where('employee_id', $employee->id)
            ->orderByDesc('created_at')
            ->get();

        $leaves = DB::table('leave_requests')
            ->where('employee_id', $employee->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'employee' => $employee,
            'education' => $employee->user->education ?? [],
            'experience' => $employee->user->experience ?? [],
            'biography' => $employee->user->biography ?? null,
            'documents' => $employee->user->documents ?? [],
            'movements' => $movements,
            'leaves' => $leaves
        ]);
    }

    /**
     * ===============================
     * ➕ CREATE EMPLOYEE
     * ===============================
     */
    public function store(Request $request)
    {
        $validatedUser = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $validatedProfile = $request->validate([
            'full_name'       => 'required|string|max:255',
            'department'      => 'required|string|max:255',
            'position'        => 'required|string|max:255',
            'position_number' => 'nullable|string|max:100',
            'grade'           => 'nullable|string|max:50',
            'step'            => 'nullable|integer|min:0',
            'salary'          => 'required|numeric',
            'gender'          => 'required|string',
            'hire_date'       => 'nullable|date',
            'status'          => 'required|string',
            'phone_number'    => 'nullable|string',
            'address'         => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validatedUser, $validatedProfile, $request) {

            $user = User::create([
                'name'     => $validatedUser['name'],
                'email'    => $validatedUser['email'],
                'password' => Hash::make($validatedUser['password']),
                'role'     => 'employee',
            ]);

            // 🔥 decode JSON
            $education  = json_decode($request->education, true) ?? [];
            $experience = json_decode($request->experience, true) ?? [];
            $documents  = json_decode($request->documents, true) ?? [];
            $biography  = json_decode($request->biography, true) ?? [];

            $data = [
                ...$validatedProfile,
                'user_id' => $user->id
            ];

            // ✅ PHOTO
            if ($request->hasFile('photo')) {
                $data['photo'] = $request->file('photo')->store('photos', 'public');
            }

            // ✅ NATIONAL ID
            if ($request->hasFile('national_id')) {
                $data['national_id'] = $request->file('national_id')->store('ids', 'public');
            }

            $employee = EmployeeProfile::create($data);

            // RELATIONS
            $user->education()->createMany($education);
            $user->experience()->createMany($experience);
            $user->documents()->createMany($documents);

            $user->biography()->create([
                'bio_text' => $biography['bio_text'] ?? ''
            ]);

            return response()->json([
                'message' => 'Employee created successfully',
                'employee' => $employee
            ], 201);
        });
    }

    /**
     * ===============================
     * ✏️ UPDATE EMPLOYEE
     * ===============================
     */
    public function update(Request $request, $id)
    {
        $employee = EmployeeProfile::findOrFail($id);
        $user = $employee->user;

        return DB::transaction(function () use ($request, $employee, $user) {

            $user->update([
                'name' => $request->name ?? $user->name,
                'email' => $request->email ?? $user->email,
                'password' => $request->password 
                    ? Hash::make($request->password) 
                    : $user->password,
            ]);

            // 🔥 decode JSON
            $education  = json_decode($request->education, true) ?? [];
            $experience = json_decode($request->experience, true) ?? [];
            $documents  = json_decode($request->documents, true) ?? [];
            $biography  = json_decode($request->biography, true) ?? [];

            $data = $request->only([
                'full_name', 'department', 'position', 'position_number',
                'grade', 'step', 'salary', 'gender', 'status',
                'hire_date', 'phone_number', 'address'
            ]);

            // ✅ PHOTO UPDATE
            if ($request->hasFile('photo')) {
                if ($employee->photo && file_exists(storage_path('app/public/' . $employee->photo))) {
                    unlink(storage_path('app/public/' . $employee->photo));
                }
                $data['photo'] = $request->file('photo')->store('photos', 'public');
            }

            if ($request->hasFile('national_id')) {
                $data['national_id'] = $request->file('national_id')->store('ids', 'public');
            }

            $employee->update($data);

            // RESET RELATIONS
            $user->education()->delete();
            $user->education()->createMany($education);

            $user->experience()->delete();
            $user->experience()->createMany($experience);

            $user->documents()->delete();
            $user->documents()->createMany($documents);

            $user->biography()->updateOrCreate(
                ['user_id' => $user->id],
                ['bio_text' => $biography['bio_text'] ?? '']
            );

            return response()->json([
                'message' => 'Employee updated successfully',
                'photo' => $employee->photo
            ]);
        });
    }

    /**
     * ===============================
     * ❌ DELETE
     * ===============================
     */
    public function destroy($id)
    {
        $employee = EmployeeProfile::findOrFail($id);

        if ($employee->photo && file_exists(storage_path('app/public/' . $employee->photo))) {
            unlink(storage_path('app/public/' . $employee->photo));
        }

        if ($employee->national_id && file_exists(storage_path('app/public/' . $employee->national_id))) {
            unlink(storage_path('app/public/' . $employee->national_id));
        }

        $employee->user()->delete();
        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully'
        ]);
    }
}