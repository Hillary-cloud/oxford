<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPsychomotorRating extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'term_id',
        'skill_id',
        'rating',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(PsychomotorSkill::class);
    }
}
