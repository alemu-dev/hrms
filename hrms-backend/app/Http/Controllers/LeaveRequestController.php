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
        return LeaveRequest::with('employee')->get();
    }

    // Director approves/rejects
    public function update(Request $request, $id)
    {
        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $request->status; // approved or rejected
        $leave->save();

        return response()->json(['message' => 'Leave request updated']);
    }
}
