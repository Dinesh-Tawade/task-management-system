<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssigned;
use App\Notifications\TaskStatusUpdated;
use Illuminate\Support\Facades\Auth;

class AuditLogObserver
{
    /**
     * Handle the model "created" event.
     */
    public function created($model): void
    {
        $actorId = Auth::id();
        $ip = request()->ip();

        if ($model instanceof Task) {
            // Log Task Creation
            AuditLog::create([
                'activity_type' => 'task_creation',
                'description' => "Task '{$model->title}' was created.",
                'user_id' => $actorId ?: $model->created_by,
                'task_id' => $model->id,
                'new_value' => json_encode($model->only(['title', 'description', 'priority', 'status', 'due_date'])),
                'ip_address' => $ip,
            ]);

            // Log Task Assignment (if assigned)
            if ($model->assigned_to) {
                $assignee = User::find($model->assigned_to);
                AuditLog::create([
                    'activity_type' => 'task_assignment',
                    'description' => "Task '{$model->title}' was assigned to " . ($assignee ? $assignee->name : "User ID {$model->assigned_to}"),
                    'user_id' => $actorId ?: $model->created_by,
                    'task_id' => $model->id,
                    'new_value' => json_encode(['assigned_to' => $model->assigned_to]),
                    'ip_address' => $ip,
                ]);

                // Dispatch notification
                if ($assignee) {
                    $assignee->notify(new TaskAssigned($model));
                }
            }
        } elseif ($model instanceof User) {
            // Log User Creation
            AuditLog::create([
                'activity_type' => 'user_creation',
                'description' => "User '{$model->name}' ({$model->email}) was created.",
                'user_id' => $actorId, // may be null if registered/seeded
                'new_value' => json_encode($model->only(['name', 'email', 'status', 'manager_id'])),
                'ip_address' => $ip,
            ]);
        }
    }

    /**
     * Handle the model "updating" event (to get dirty values).
     */
    public function updating($model): void
    {
        $actorId = Auth::id();
        $ip = request()->ip();

        if ($model instanceof Task) {
            // Log Status Change
            if ($model->isDirty('status')) {
                $oldStatus = $model->getOriginal('status');
                $newStatus = $model->status;
                
                AuditLog::create([
                    'activity_type' => 'task_status_change',
                    'description' => "Status of task '{$model->title}' changed from '{$oldStatus}' to '{$newStatus}'.",
                    'user_id' => $actorId ?: $model->created_by,
                    'task_id' => $model->id,
                    'old_value' => $oldStatus,
                    'new_value' => $newStatus,
                    'ip_address' => $ip,
                ]);

                // Dispatch notification to task creator
                $updater = Auth::user();
                $creator = User::find($model->created_by);
                if ($updater && $creator && $updater->id !== $creator->id) {
                    $creator->notify(new TaskStatusUpdated($model, $updater));
                }
            }

            // Log Task Assignment
            if ($model->isDirty('assigned_to')) {
                $oldAssigneeId = $model->getOriginal('assigned_to');
                $newAssigneeId = $model->assigned_to;
                
                $oldAssignee = $oldAssigneeId ? User::find($oldAssigneeId) : null;
                $newAssignee = $newAssigneeId ? User::find($newAssigneeId) : null;

                $desc = "Assignment of task '{$model->title}' changed ";
                if ($oldAssignee) $desc .= "from {$oldAssignee->name} ";
                if ($newAssignee) $desc .= "to {$newAssignee->name}";
                else $desc .= "to Unassigned";

                AuditLog::create([
                    'activity_type' => 'task_assignment',
                    'description' => $desc,
                    'user_id' => $actorId ?: $model->created_by,
                    'task_id' => $model->id,
                    'old_value' => $oldAssigneeId,
                    'new_value' => $newAssigneeId,
                    'ip_address' => $ip,
                ]);

                // Dispatch notification to new assignee
                if ($newAssignee) {
                    $newAssignee->notify(new TaskAssigned($model));
                }
            }

            // Log general task updates (other fields)
            $dirtyFields = $model->getDirty();
            // Remove status and assigned_to since they are logged separately
            unset($dirtyFields['status'], $dirtyFields['assigned_to'], $dirtyFields['updated_at']);

            if (!empty($dirtyFields)) {
                $origFields = [];
                foreach ($dirtyFields as $field => $val) {
                    $origFields[$field] = $model->getOriginal($field);
                }

                AuditLog::create([
                    'activity_type' => 'task_update',
                    'description' => "Task '{$model->title}' fields were updated.",
                    'user_id' => $actorId ?: $model->created_by,
                    'task_id' => $model->id,
                    'old_value' => json_encode($origFields),
                    'new_value' => json_encode($dirtyFields),
                    'ip_address' => $ip,
                ]);
            }
        } elseif ($model instanceof User) {
            // Log User Updates
            $dirtyFields = $model->getDirty();
            unset($dirtyFields['updated_at'], $dirtyFields['password']); // don't log password hashes!

            if (!empty($dirtyFields)) {
                $origFields = [];
                foreach ($dirtyFields as $field => $val) {
                    $origFields[$field] = $model->getOriginal($field);
                }

                AuditLog::create([
                    'activity_type' => 'user_update',
                    'description' => "User '{$model->name}' details were updated.",
                    'user_id' => $actorId,
                    'old_value' => json_encode($origFields),
                    'new_value' => json_encode($dirtyFields),
                    'ip_address' => $ip,
                ]);
            }
        }
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted($model): void
    {
        $actorId = Auth::id();
        $ip = request()->ip();

        if ($model instanceof Task) {
            AuditLog::create([
                'activity_type' => 'task_deletion',
                'description' => "Task '{$model->title}' was deleted.",
                'user_id' => $actorId,
                'ip_address' => $ip,
            ]);
        }
    }
}
