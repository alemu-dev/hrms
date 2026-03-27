<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    // Employee submits leave
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employee_profiles,id',
            'type'        => 'required|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
        ]);

        $leave = LeaveRequest::create([
            'employee_id' => $validated['employee_id'],
            'type'        => $validated['type'],
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Leave request submitted',
            'leave'   => $leave
        ], 201);
    }

    // Director views all requests
    public function index()
    {
        $leaveRequests = LeaveRequest::with('employee')->get()
            ->map(function ($leave) {
                return [
                    'id'            => $leave->id,
                    'type'          => $leave->type,
                    'start_date'    => $leave->start_date,
                    'end_date'      => $leave->end_date,
                    'status'        => $leave->status,
                    'employee_name' => $leave->employee->full_name ?? null,
                    'department'    => $leave->employee->department ?? null,
                    'position'      => $leave->employee->position ?? null,
                ];
            });

        return response()->json($leaveRequests);
    }

    // Director approves/rejects
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $validated['status'];
        $leave->save();

        return response()->json([
            'message' => 'Leave request updated',
            'leave'   => $leave
        ]);
    }

    // ✅ Employee views their own leave requests
    public function indexByEmployee($employeeId)
    {
        $leaveRequests = LeaveRequest::where('employee_id', $employeeId)->get()
            ->map(function ($leave) {
                return [
                    'id'         => $leave->id,
                    'type'       => $leave->type,
                    'start_date' => $leave->start_date,
                    'end_date'   => $leave->end_date,
                    'status'     => $leave->status,
                ];
            });

        return response()->json($leaveRequests);
    }
}
