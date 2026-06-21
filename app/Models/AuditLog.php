<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    // Turn off timestamps since we only have created_at
    public $timestamps = false;

    protected $fillable = [
        'activity_type',
        'description',
        'user_id',
        'task_id',
        'old_value',
        'new_value',
        'ip_address',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the user associated with this audit log entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
