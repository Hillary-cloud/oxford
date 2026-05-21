<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CbtAttempt extends Model
{
    use HasUuids;

    protected $fillable = [
        'cbt_exam_id', 'student_id',
        'started_at', 'submitted_at',
        'score_obtained', 'total_questions_answered',
        'remaining_seconds', 'data_snapshot',
        'status'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'data_snapshot' => 'array',
    ];

    public function exam()
    {
        return $this->belongsTo(CbtExam::class, 'cbt_exam_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function answers()
    {
        return $this->hasMany(CbtAnswer::class);
    }
}
