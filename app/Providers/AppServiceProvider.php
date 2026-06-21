<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Listeners\LoginListener;
use App\Listeners\LogoutListener;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\User::observe(\App\Observers\AuditLogObserver::class);
        \App\Models\Task::observe(\App\Observers\AuditLogObserver::class);

        Event::listen(Login::class, LoginListener::class);
        Event::listen(Logout::class, LogoutListener::class);

        if (env('MAIL_TO')) {
            \Illuminate\Support\Facades\Mail::alwaysTo(env('MAIL_TO'));
        }
    }
}
