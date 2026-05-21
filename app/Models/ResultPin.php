<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultPin extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'student_id',
        'academic_session_id',
        'term_id',
        'pin_code',
        'serial_number',
        'usage_count',
        'max_usage',
        'generated_by',
    ];

    protected $casts = [
        'usage_count' => 'integer',
        'max_usage' => 'integer',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
