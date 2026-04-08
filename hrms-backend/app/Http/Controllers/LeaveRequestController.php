<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    /**
     * Employee submits a leave request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'    => 'required|exists:users,id',   // ✅ matches table
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'required|string',
        ]);

        $leave = LeaveRequest::create([
            'user_id'    => $validated['user_id'],
            'start_date' => $validated['start_date'],
            'end_date'   => $validated['end_date'],
            'reason'     => $validated['reason'],
            'status'     => 'pending', // default status
        ]);

        return response()->json([
            'message' => 'Leave request submitted successfully',
            'data'    => $leave
        ], 201);
    }

    /**
     * Director views all leave requests
     */
    public function index()
    {
        $leaveRequests = LeaveRequest::with('user')->get()
            ->map(function ($leave) {
                return [
                    'id'         => $leave->id,
                    'reason'     => $leave->reason,
                    'start_date' => $leave->start_date,
                    'end_date'   => $leave->end_date,
                    'status'     => $leave->status,
                    'user_name'  => $leave->user->name ?? null,
                ];
            });

        return response()->json($leaveRequests);
    }

    /**
     * Director approves or rejects a leave request
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $validated['status'];
        $leave->save();

        return response()->json([
            'message' => 'Leave request updated successfully',
            'data'    => $leave
        ]);
    }

    /**
     * Employee views their own leave requests
     */
    public function indexByUser($userId)
    {
        $leaveRequests = LeaveRequest::where('user_id', $userId)->get()
            ->map(function ($leave) {
                return [
                    'id'         => $leave->id,
                    'reason'     => $leave->reason,
                    'start_date' => $leave->start_date,
                    'end_date'   => $leave->end_date,
                    'status'     => $leave->status,
                ];
            });

        return response()->json($leaveRequests);
    }
}
