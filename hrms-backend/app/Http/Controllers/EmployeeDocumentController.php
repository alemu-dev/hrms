<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDocument;
use Illuminate\Http\Request;

class EmployeeDocumentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'document_type' => 'required|string',
            'file' => 'required|file',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        $document = EmployeeDocument::create([
            'user_id' => $validated['user_id'],
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'uploaded_at' => now(),
        ]);

        return response()->json($document, 201);
    }

    public function all()
    {
        return EmployeeDocument::all();
    }

    public function index($userId)
    {
        return EmployeeDocument::where('user_id', $userId)->get();
    }
}
