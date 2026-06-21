<?php

namespace App\Listeners;

use App\Models\AuditLog;
use Illuminate\Auth\Events\Login;

class LoginListener
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        
        AuditLog::create([
            'activity_type' => 'user_login',
            'description' => "User '{$user->name}' logged in.",
            'user_id' => $user->id,
            'ip_address' => request()->ip(),
        ]);
    }
}
