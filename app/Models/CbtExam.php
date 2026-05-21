<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CbtExam extends Model
{
    use HasUuids;

    protected $fillable = [
        'academic_session_id', 'term_id', 'subject_id', 'school_class_id',
        'title', 'description', 'duration_minutes', 'total_marks', 'pass_mark',
        'start_date', 'end_date', 'is_published', 'shuffle_questions',
        'show_result_immediately', 'result_assessment_name'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_published' => 'boolean',
        'shuffle_questions' => 'boolean',
        'show_result_immediately' => 'boolean',
    ];

    public function questions()
    {
        return $this->hasMany(CbtQuestion::class)->orderBy('display_order');
    }

    public function attempts()
    {
        return $this->hasMany(CbtAttempt::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function sections()
    {
        return $this->belongsToMany(ClassSection::class, 'cbt_exam_sections', 'cbt_exam_id', 'class_section_id')
            ->using(CbtExamSection::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }
}
