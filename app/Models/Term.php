<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    use HasUuids, HasFactory;
    protected $fillable = ['academic_session_id', 'name', 'start_date', 'end_date', 'is_current', 'result_published_at'];

    protected $casts = [
        'is_current' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'result_published_at' => 'datetime',
    ];

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class);
    }
}
