<?php

namespace App\Listeners;

use App\Models\AuditLog;
use Illuminate\Auth\Events\Logout;

class LogoutListener
{
    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        $user = $event->user;
        
        if ($user) {
            AuditLog::create([
                'activity_type' => 'user_logout',
                'description' => "User '{$user->name}' logged out.",
                'user_id' => $user->id,
                'ip_address' => request()->ip(),
            ]);
        }
    }
}
