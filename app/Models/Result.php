<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Result extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'term_id',
        'subject_id',
        'class_section_id',
        'assessments', // JSON: [{"name": "CA1", "score": 10}, {"name": "CA2", "score": 15}]
        'exam_score',
        'total_score',
        'grade',
        'remarks',
        'position',
    ];

    protected $casts = [
        'assessments' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class);
    }

    /**
     * Compute grade based on dynamic grading scale
     */
    public static function computeDynamicGrade($total)
    {
        $grade = Grade::where('min_score', '<=', $total)
            ->where('max_score', '>=', $total)
            ->first();

        return $grade ? [
            'name' => $grade->name,
            'remarks' => $grade->remarks
        ] : [
            'name' => 'F',
            'remarks' => 'Fail'
        ];
    }
}
