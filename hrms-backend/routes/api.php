<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeEducationController;
use App\Http\Controllers\EmployeeExperienceController;
use App\Http\Controllers\EmployeeBiographyController;
use App\Http\Controllers\EmployeeDocumentController;

// Login route
Route::post('/login', [UserController::class, 'login']);

// User routes
Route::get('/users', [UserController::class, 'index']);   // list all users
Route::post('/users', [UserController::class, 'store']);  // create new user

// Leave request routes
Route::post('/leave-requests', [LeaveRequestController::class, 'store']);   // employee submits
Route::get('/leave-requests', [LeaveRequestController::class, 'index']);    // director views
Route::patch('/leave-requests/{id}', [LeaveRequestController::class, 'update']); // approve/reject
Route::get('/leave-requests/{employeeId}', [LeaveRequestController::class, 'indexByEmployee']); // employee views own requests

// Employee routes (handled only by EmployeeController)
Route::get('/employees', [EmployeeController::class, 'index']);       // list all employees
Route::get('/employees/{id}', [EmployeeController::class, 'show']);   // show one employee by profile ID
Route::post('/employees', [EmployeeController::class, 'store']);      // create employee
Route::put('/employees/{id}', [EmployeeController::class, 'update']); // update employee
Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']); // delete employee

// ✅ New route: fetch employee profile by user_id (for EmployeeWorkspace)
Route::get('/employee-profile/{userId}', [EmployeeController::class, 'showByUser']);


Route::post('/employee-education', [EmployeeEducationController::class, 'store']);
Route::get('/employee-education', [EmployeeEducationController::class, 'all']); // list all
Route::get('/employee-education/{userId}', [EmployeeEducationController::class, 'index']); // list by user


// Experience
Route::post('/employee-experience', [EmployeeExperienceController::class, 'store']);
Route::get('/employee-experience', [EmployeeExperienceController::class, 'all']);
Route::get('/employee-experience/{userId}', [EmployeeExperienceController::class, 'index']);

// Biography
Route::post('/employee-biography', [EmployeeBiographyController::class, 'store']);
Route::get('/employee-biography', [EmployeeBiographyController::class, 'all']);
Route::get('/employee-biography/{userId}', [EmployeeBiographyController::class, 'show']);

// Documents
Route::post('/employee-documents', [EmployeeDocumentController::class, 'store']);
Route::get('/employee-documents', [EmployeeDocumentController::class, 'all']);
Route::get('/employee-documents/{userId}', [EmployeeDocumentController::class, 'index']);

