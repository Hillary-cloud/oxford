<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TerminalRemark extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'term_id',
        'form_teacher_remark',
        'principal_remark',
        'promotion_status',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function session()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }
}
