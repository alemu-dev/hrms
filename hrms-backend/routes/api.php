<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\EmployeeController;

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
