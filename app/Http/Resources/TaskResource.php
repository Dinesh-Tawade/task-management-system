<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
            'due_date' => $this->due_date ? $this->due_date->format('Y-m-d H:i:s') : null,
            'assigned_to' => new UserResource($this->whenLoaded('assignedTo')),
            'assigned_to_id' => $this->assigned_to,
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'created_by_id' => $this->created_by,
            'histories' => TaskHistoryResource::collection($this->whenLoaded('histories')),
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
