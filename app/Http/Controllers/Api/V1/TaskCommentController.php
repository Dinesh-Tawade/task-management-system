<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    /**
     * Display a listing of comments for a task.
     */
    public function index(Request $request, Task $task)
    {
        // Handled by authorization (same as viewing task)
        $user = $request->user();
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager') && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comments = $task->comments()->with('user')->get();

        return response()->json([
            'data' => $comments
        ], 200);
    }

    /**
     * Store a comment on a task.
     */
    public function store(Request $request, Task $task)
    {
        $user = $request->user();
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager') && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'comment' => 'required|string',
        ]);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'comment' => $request->comment,
        ]);

        $comment->load('user');

        return response()->json([
            'data' => $comment
        ], 201);
    }
}
