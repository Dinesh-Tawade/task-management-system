<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $task;
    protected $updater;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, User $updater)
    {
        $this->task = $task;
        $this->updater = $updater;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Task Status Updated: ' . $this->task->title)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('The status of the task **' . $this->task->title . '** has been updated.')
            ->line('**Updated by:** ' . $this->updater->name)
            ->line('**New Status:** ' . ucfirst($this->task->status))
            ->action('View Task Dashboard', url('/'))
            ->line('Thank you for using our Task Management System!');
    }
}
