<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PromotionDecision extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'annual_average',
        'total_failed_subjects',
        'status',
        'decision_method',
        'reason',
        'processed_by',
        'is_locked',
        'form_teacher_remark',
        'principal_remark',
    ];

    protected $casts = [
        'annual_average' => 'decimal:2',
        'is_locked' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function session()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
