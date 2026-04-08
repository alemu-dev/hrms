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

// -----------------------------------------------------------
// PUBLIC ROUTES
// -----------------------------------------------------------
Route::post('/login', [UserController::class, 'login']);


// -----------------------------------------------------------
// PROTECTED ROUTES (Requires valid Token/Login)
// -----------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // --- User & Auth ---
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
 
    // --- Director Analytics ---
Route::get('/director-stats', [EmployeeController::class, 'getStats']);

    // --- Overview ---
    Route::get('/overview', [OverviewController::class, 'index']);
    Route::post('/overview', [OverviewController::class, 'store']);

    // --- Leave Requests ---
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::patch('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
    Route::get('/leave-requests/{userId}', [LeaveRequestController::class, 'indexByUser']);

    // --- Employees ---
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

    // Profile access routes
    Route::get('/employee-profile/{userId}', [EmployeeController::class, 'showByUser']);
    Route::get('/employee-by-user/{userId}', [EmployeeController::class, 'showByUser']);

    // --- Education ---
    Route::post('/employee-education', [EmployeeEducationController::class, 'store']);
    Route::get('/employee-education', [EmployeeEducationController::class, 'all']);
    Route::get('/employee-education/{userId}', [EmployeeEducationController::class, 'index']);
    Route::put('/employee-education/{id}', [EmployeeEducationController::class, 'update']);
    Route::delete('/employee-education/{id}', [EmployeeEducationController::class, 'destroy']);

    // --- Experience ---
    Route::post('/employee-experience', [EmployeeExperienceController::class, 'store']);
    Route::get('/employee-experience', [EmployeeExperienceController::class, 'all']);
    Route::get('/employee-experience/{userId}', [EmployeeExperienceController::class, 'index']);
    Route::put('/employee-experience/{id}', [EmployeeExperienceController::class, 'update']);
    Route::delete('/employee-experience/{id}', [EmployeeExperienceController::class, 'destroy']);

    // --- Biography ---
    Route::post('/employee-biography', [EmployeeBiographyController::class, 'store']);
    Route::get('/employee-biography', [EmployeeBiographyController::class, 'all']);
    Route::get('/employee-biography/{userId}', [EmployeeBiographyController::class, 'show']);
    Route::put('/employee-biography/{id}', [EmployeeBiographyController::class, 'update']);
    Route::delete('/employee-biography/{id}', [EmployeeBiographyController::class, 'destroy']);

    // --- Documents ---
    Route::post('/employee-documents', [EmployeeDocumentController::class, 'store']);
    Route::get('/employee-documents', [EmployeeDocumentController::class, 'all']);
    Route::get('/employee-documents/{userId}', [EmployeeDocumentController::class, 'index']);
    Route::delete('/employee-documents/{id}', [EmployeeDocumentController::class, 'destroy']);

});