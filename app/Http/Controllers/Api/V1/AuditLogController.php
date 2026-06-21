<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('Admin')) {
            $query = AuditLog::query()->with('user');
        } elseif ($user->hasRole('Manager')) {
            $teamUserIds = User::where('manager_id', $user->id)
                ->orWhere('id', $user->id)
                ->pluck('id');

            $query = AuditLog::query()->with('user')
                ->where(function ($q) use ($teamUserIds) {
                    $q->whereIn('user_id', $teamUserIds)
                      ->orWhereIn('task_id', function ($sub) use ($teamUserIds) {
                          $sub->select('id')->from('tasks')
                              ->whereIn('assigned_to', $teamUserIds)
                              ->orWhereIn('created_by', $teamUserIds);
                      });
                });
        } elseif ($user->hasRole('Employee')) {
            $query = AuditLog::query()->with('user')->where('user_id', $user->id);
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Apply filters
        if ($request->has('activity_type') && $request->activity_type !== '') {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->has('user_id') && $request->user_id !== '') {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('start_date') && $request->start_date !== '') {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date !== '') {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $logs
        ], 200);
    }
}
