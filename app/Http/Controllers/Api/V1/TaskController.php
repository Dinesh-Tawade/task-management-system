<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Task::query()->with(['assignedTo', 'creator', 'comments']);

        // Check user role and filter accordingly
        if ($user->hasRole('Employee')) {
            $query->where('assigned_to', $user->id);
        }

        // Apply filters
        if ($request->has('status') && $request->status !== '') {
            if ($request->status === 'overdue') {
                $query->where('status', '!=', 'completed')
                      ->where('due_date', '<', now());
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to') && $request->assigned_to !== '') {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('created_by') && $request->created_by !== '') {
            $query->where('created_by', $request->created_by);
        }

        // Team filter for Managers
        if ($request->has('team_only') && $request->team_only == '1') {
            $teamUserIds = User::where('manager_id', $user->id)->pluck('id');
            $query->where(function ($q) use ($user, $teamUserIds) {
                $q->whereIn('assigned_to', $teamUserIds)
                  ->orWhere('created_by', $user->id);
            });
        }

        $tasks = $query->latest()->get();

        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $this->authorize('create', Task::class);

        $validated = $request->validated();
        $validated['created_by'] = $request->user()->id;

        $task = Task::create($validated);
        $task->load(['assignedTo', 'creator']);

        return new TaskResource($task);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);

        $task->load(['assignedTo', 'creator', 'comments.user', 'histories.user']);

        return new TaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorize('update', $task);

        $user = $request->user();
        $validated = $request->validated();

        // Enforce employee restrictions: Employees can only change task status
        if ($user->hasRole('Employee')) {
            $validated = array_intersect_key($validated, array_flip(['status']));
            
            if (empty($validated)) {
                return response()->json([
                    'message' => 'Employees can only update the status of their assigned tasks.'
                ], 422);
            }
        }

        $task->update($validated);
        $task->load(['assignedTo', 'creator', 'comments.user', 'histories.user']);

        return new TaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.'
        ], 200);
    }
}
