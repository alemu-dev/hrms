<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDocument;
use Illuminate\Http\Request;

class EmployeeDocumentController extends Controller
{
    // Create new document record
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

    // List all documents
    public function all()
    {
        return EmployeeDocument::all();
    }

    // List documents for a specific user
    public function index($userId)
    {
        return EmployeeDocument::where('user_id', $userId)->get();
    }

    // ✅ Update a document record (metadata only, not file)
    public function update(Request $request, $id)
    {
        $document = EmployeeDocument::findOrFail($id);

        $validated = $request->validate([
            'document_type' => 'nullable|string',
        ]);

        $document->update($validated);

        return response()->json([
            'message' => 'Document record updated successfully',
            'data' => $document
        ]);
    }

    // ✅ Delete a document record
    public function destroy($id)
    {
        $document = EmployeeDocument::findOrFail($id);

        // Optionally delete the file from storage
        if ($document->file_path && \Storage::disk('public')->exists($document->file_path)) {
            \Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'message' => 'Document record deleted successfully'
        ]);
    }
}
