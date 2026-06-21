<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        $adminRole = Role::create(['name' => 'Admin']);
        $managerRole = Role::create(['name' => 'Manager']);
        $employeeRole = Role::create(['name' => 'Employee']);

        // Create Admin
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $admin->assignRole($adminRole);

        // Create Manager
        $manager = User::create([
            'name' => 'Project Manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $manager->assignRole($managerRole);

        // Create Employee 1 (Assigned to Manager)
        $employee1 = User::create([
            'name' => 'John Employee',
            'email' => 'employee@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'manager_id' => $manager->id,
        ]);
        $employee1->assignRole($employeeRole);

        // Create Employee 2 (Assigned to Manager)
        $employee2 = User::create([
            'name' => 'Sarah Developer',
            'email' => 'sarah@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'manager_id' => $manager->id,
        ]);
        $employee2->assignRole($employeeRole);

        // Create Employee 3 (Inactive status, no manager)
        $employee3 = User::create([
            'name' => 'Retired Employee',
            'email' => 'retired@example.com',
            'password' => Hash::make('password'),
            'status' => 'inactive',
        ]);
        $employee3->assignRole($employeeRole);

        // Create Tasks
        // Task 1: Completed, On Time
        $task1 = Task::create([
            'title' => 'Design System Database Schema',
            'description' => 'Normalize tables, add indexes, and document relationships for the new task board.',
            'priority' => 'high',
            'status' => 'completed',
            'due_date' => now()->addDays(2),
            'assigned_to' => $employee1->id,
            'created_by' => $manager->id,
        ]);

        // Task 2: In-Progress
        $task2 = Task::create([
            'title' => 'Implement REST API Authentication',
            'description' => 'Build login, logout, and token-based protection using Laravel Sanctum.',
            'priority' => 'high',
            'status' => 'in-progress',
            'due_date' => now()->addDays(4),
            'assigned_to' => $employee1->id,
            'created_by' => $manager->id,
        ]);

        // Task 3: Overdue (Pending, Due in the past)
        $task3 = Task::create([
            'title' => 'Integrate Tailwind CSS v4 in React',
            'description' => 'Set up Vite with the new Tailwind v4 theme engine and fonts.',
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => now()->subDays(3),
            'assigned_to' => $employee2->id,
            'created_by' => $manager->id,
        ]);

        // Task 4: Unassigned, Pending
        $task4 = Task::create([
            'title' => 'Write Automated Feature Tests',
            'description' => 'Write PHPUnit integration tests for roles authorization and task CRUD API.',
            'priority' => 'low',
            'status' => 'pending',
            'due_date' => now()->addDays(10),
            'assigned_to' => null,
            'created_by' => $admin->id,
        ]);

        // Task 5: Completed by employee 2
        $task5 = Task::create([
            'title' => 'Develop Dashboard KPI Summaries',
            'description' => 'Create SQL query helpers to count tasks by assignee and calculate overdue percentages.',
            'priority' => 'medium',
            'status' => 'completed',
            'due_date' => now()->addDays(1),
            'assigned_to' => $employee2->id,
            'created_by' => $manager->id,
        ]);

        // Seed Comments
        TaskComment::create([
            'task_id' => $task2->id,
            'user_id' => $employee1->id,
            'comment' => 'Sanctum tokens are working! I am setting up the AuthContext in React now.',
        ]);

        TaskComment::create([
            'task_id' => $task2->id,
            'user_id' => $manager->id,
            'comment' => 'Sounds good. Make sure to log any authentication errors in the audit logs.',
        ]);

        TaskComment::create([
            'task_id' => $task3->id,
            'user_id' => $employee2->id,
            'comment' => 'Tailwind v4 theme setup is encountering a compiler warning. I will debug this tomorrow.',
        ]);

        // Seed Audit Logs (to simulate system timeline and reports)
        AuditLog::create([
            'activity_type' => 'user_login',
            'description' => "User 'System Admin' logged in.",
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(10),
        ]);

        AuditLog::create([
            'activity_type' => 'user_login',
            'description' => "User 'Project Manager' logged in.",
            'user_id' => $manager->id,
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(8),
        ]);

        AuditLog::create([
            'activity_type' => 'task_creation',
            'description' => "Task 'Design System Database Schema' was created.",
            'user_id' => $manager->id,
            'task_id' => $task1->id,
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(7),
        ]);

        AuditLog::create([
            'activity_type' => 'task_assignment',
            'description' => "Task 'Design System Database Schema' was assigned to John Employee.",
            'user_id' => $manager->id,
            'task_id' => $task1->id,
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(7),
        ]);

        AuditLog::create([
            'activity_type' => 'task_status_change',
            'description' => "Status of task 'Design System Database Schema' changed from 'pending' to 'in-progress'.",
            'user_id' => $employee1->id,
            'task_id' => $task1->id,
            'old_value' => 'pending',
            'new_value' => 'in-progress',
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(5),
        ]);

        AuditLog::create([
            'activity_type' => 'task_status_change',
            'description' => "Status of task 'Design System Database Schema' changed from 'in-progress' to 'completed'.",
            'user_id' => $employee1->id,
            'task_id' => $task1->id,
            'old_value' => 'in-progress',
            'new_value' => 'completed',
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(4),
        ]);

        AuditLog::create([
            'activity_type' => 'user_creation',
            'description' => "User 'Sarah Developer' (sarah@example.com) was created.",
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'created_at' => now()->subHours(3),
        ]);
    }
}
