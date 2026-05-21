<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Graduation extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'graduated_at',
        'certificate_number',
        'final_remark',
    ];

    protected $casts = [
        'graduated_at' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }
}
