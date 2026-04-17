<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeEducationController;
use App\Http\Controllers\EmployeeExperienceController;
use App\Http\Controllers\EmployeeBiographyController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\EmployeeMovementController;

// -----------------------------------------------------------
// PUBLIC ROUTES
// -----------------------------------------------------------
Route::post('/login', [UserController::class, 'login']);

// -----------------------------------------------------------
// PROTECTED ROUTES (Requires Sanctum Auth)
// -----------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // ---------------- USER ----------------
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);

    // ---------------- DIRECTOR DASHBOARD ----------------
    Route::get('/director-stats', [EmployeeController::class, 'getStats']);

    // ---------------- OVERVIEW ----------------
    Route::get('/overview', [OverviewController::class, 'index']);
    Route::post('/overview', [OverviewController::class, 'store']);

    // ---------------- LEAVE REQUESTS ----------------
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::patch('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
    
    // ✅ FIXED: Cleaner and matching URL for employee-side leave requests
    Route::get('/leave-requests/{userId}', [LeaveRequestController::class, 'indexByUser']);

    // ---------------- EMPLOYEES ----------------
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

    // Report Route
    Route::get('/report/{userId}', [EmployeeController::class, 'report']);

    // Profile access (used by both HR and Employee portals)
    Route::get('/employee-profile/{userId}', [EmployeeController::class, 'showByUser']);
    Route::get('/employee-by-user/{userId}', [EmployeeController::class, 'showByUser']);

    // ---------------- EDUCATION ----------------
    Route::post('/employee-education', [EmployeeEducationController::class, 'store']);
    Route::get('/employee-education', [EmployeeEducationController::class, 'all']);
    Route::get('/employee-education/{userId}', [EmployeeEducationController::class, 'index']);
    Route::put('/employee-education/{id}', [EmployeeEducationController::class, 'update']);
    Route::delete('/employee-education/{id}', [EmployeeEducationController::class, 'destroy']);

    // ---------------- EXPERIENCE ----------------
    Route::post('/employee-experience', [EmployeeExperienceController::class, 'store']);
    Route::get('/employee-experience', [EmployeeExperienceController::class, 'all']);
    Route::get('/employee-experience/{userId}', [EmployeeExperienceController::class, 'index']);
    Route::put('/employee-experience/{id}', [EmployeeExperienceController::class, 'update']);
    Route::delete('/employee-experience/{id}', [EmployeeExperienceController::class, 'destroy']);

    // ---------------- BIOGRAPHY ----------------
    Route::post('/employee-biography', [EmployeeBiographyController::class, 'store']);
    Route::get('/employee-biography', [EmployeeBiographyController::class, 'all']);
    Route::get('/employee-biography/{userId}', [EmployeeBiographyController::class, 'show']);
    Route::put('/employee-biography/{id}', [EmployeeBiographyController::class, 'update']);
    Route::delete('/employee-biography/{id}', [EmployeeBiographyController::class, 'destroy']);

    // ---------------- DOCUMENTS ----------------
    Route::post('/employee-documents', [EmployeeDocumentController::class, 'store']);
    Route::get('/employee-documents', [EmployeeDocumentController::class, 'all']);
    Route::get('/employee-documents/{userId}', [EmployeeDocumentController::class, 'index']);
    Route::delete('/employee-documents/{id}', [EmployeeDocumentController::class, 'destroy']);

    // ---------------- MOVEMENTS ----------------
    Route::get('/movements', [EmployeeMovementController::class, 'index']);
    Route::post('/movements', [EmployeeMovementController::class, 'store']);
    Route::put('/movements/{id}', [EmployeeMovementController::class, 'update']);
    Route::delete('/movements/{id}', [EmployeeMovementController::class, 'destroy']);

});