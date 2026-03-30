<?php

namespace App\Http\Controllers;

use App\Models\Overview;
use Illuminate\Http\Request;

class OverviewController extends Controller
{
    /**
     * Get the latest overview record.
     */
    public function index()
    {
        return response()->json(
            Overview::latest()->first(),
            200
        );
    }

    /**
     * Store a new overview record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',          // expects YYYY-MM-DD format
            'announcement' => 'required|string|max:255',
            'system_status' => 'required|string|max:255',
        ]);

        $overview = Overview::create($validated);

        return response()->json([
            'message' => 'Overview created successfully',
            'data' => $overview
        ], 201);
    }

    /**
     * Optionally: update the latest overview instead of creating new each time.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'announcement' => 'required|string|max:255',
            'system_status' => 'required|string|max:255',
        ]);

        $overview = Overview::findOrFail($id);
        $overview->update($validated);

        return response()->json([
            'message' => 'Overview updated successfully',
            'data' => $overview
        ], 200);
    }
}
