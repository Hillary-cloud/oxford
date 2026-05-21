<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AnnualResult extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'subject_id',
        'term1_score',
        'term2_score',
        'term3_score',
        'annual_score',
        'grade',
    ];

    protected $casts = [
        'term1_score' => 'decimal:2',
        'term2_score' => 'decimal:2',
        'term3_score' => 'decimal:2',
        'annual_score' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function session()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
