<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Only Admin and Manager should see all users
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = User::query()->with(['roles', 'manager']);

        // Eager load task count aggregates
        $query->withCount([
            'assignedTasks',
            'assignedTasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'completed');
            }
        ]);

        // Filter by Manager if Team Only or Manager is requesting
        if ($user->hasRole('Manager') && $request->has('team_only')) {
            $query->where('manager_id', $user->id);
        }

        // Apply filters
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role !== '') {
            $query->role($request->role);
        }

        $users = $query->get();

        // Map and append task counts manually to UserResource format
        return response()->json([
            'data' => $users->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'status' => $u->status,
                    'manager_id' => $u->manager_id,
                    'manager' => $u->manager ? [
                        'id' => $u->manager->id,
                        'name' => $u->manager->name,
                    ] : null,
                    'roles' => $u->roles->pluck('name'),
                    'assigned_tasks_count' => $u->assigned_tasks_count,
                    'completed_tasks_count' => $u->completed_tasks_count,
                    'created_at' => $u->created_at ? $u->created_at->format('Y-m-d H:i:s') : null,
                ];
            })
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'status' => 'required|in:active,inactive',
            'manager_id' => 'nullable|exists:users,id',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
            'manager_id' => $validated['manager_id'],
        ]);

        $user->assignRole($validated['role']);
        $user->load(['roles', 'manager']);

        return response()->json([
            'message' => 'User created successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'manager_id' => $user->manager_id,
                'roles' => $user->roles->pluck('name'),
            ]
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        if (!$request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'status' => 'required|in:active,inactive',
            'manager_id' => 'nullable|exists:users,id',
            'role' => 'required|exists:roles,name',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'status' => $validated['status'],
            'manager_id' => $validated['manager_id'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);
        $user->syncRoles([$validated['role']]);
        $user->load(['roles', 'manager']);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'manager_id' => $user->manager_id,
                'roles' => $user->roles->pluck('name'),
            ]
        ], 200);
    }

    /**
     * Toggle status (active/inactive) for a user.
     */
    public function toggleStatus(Request $request, User $user)
    {
        if (!$request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return response()->json([
            'message' => "User status updated to '{$user->status}'",
            'status' => $user->status
        ], 200);
    }
}
