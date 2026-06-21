<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\TaskCommentController;
use App\Http\Controllers\Api\V1\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public route
    Route::post('/login', [AuthController::class, 'login']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Users routes
        Route::get('user', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $user->load('roles');
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'roles' => $user->roles->pluck('name'),
            ]);
        });
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'update']);
        Route::put('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        
        // Tasks API CRUD
        Route::apiResource('tasks', TaskController::class);

        // Task Comments API
        Route::get('tasks/{task}/comments', [TaskCommentController::class, 'index']);
        Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store']);

        // System Audit Logs
        Route::get('audit-logs', [AuditLogController::class, 'index']);
    });
});
