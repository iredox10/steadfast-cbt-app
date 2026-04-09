<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminNotification extends Notification
{
    use Queueable;

    public $message;

    public $type;

    public $actionUrl;

    public $icon;

    /**
     * Create a new notification instance.
     */
    public function __construct($message, $type = 'info', $actionUrl = null, $icon = 'bell')
    {
        $this->message = $message;
        $this->type = $type;
        $this->actionUrl = $actionUrl;
        $this->icon = $icon;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
            'icon' => $this->icon,
        ];
    }
}
