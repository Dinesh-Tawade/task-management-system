<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    protected $task;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task)
    {
        $this->task = $task;
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
        $creatorName = $this->task->creator ? $this->task->creator->name : 'Manager';
        
        return (new MailMessage)
            ->subject('New Task Assigned: ' . $this->task->title)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('You have been assigned a new task: **' . $this->task->title . '**.')
            ->line('**Description:** ' . ($this->task->description ?: 'No description provided.'))
            ->line('**Priority:** ' . ucfirst($this->task->priority))
            ->line('**Due Date:** ' . ($this->task->due_date ? $this->task->due_date->format('Y-m-d H:i:s') : 'N/A'))
            ->line('Assigned by: ' . $creatorName)
            ->action('View Task Dashboard', url('/'))
            ->line('Thank you for using our Task Management System!');
    }
}
