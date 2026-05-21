<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeAssignment extends Model
{
    use HasUuids;

    protected $fillable = [
        'fee_type_id',
        'target_type',
        'school_class_id',
        'student_id',
        'fee_group_id',
        'gender',
    ];

    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function feeGroup(): BelongsTo
    {
        return $this->belongsTo(FeeGroup::class);
    }

    /**
     * Human-readable label for this assignment.
     */
    public function getTargetLabelAttribute(): string
    {
        return match ($this->target_type) {
            'all'     => 'All Students',
            'class'   => 'Class: ' . ($this->schoolClass?->name ?? '—'),
            'student' => 'Student: ' . ($this->student?->surname ?? '—') . ' ' . ($this->student?->othername ?? ''),
            'group'   => 'Group: ' . ($this->feeGroup?->name ?? '—'),
            'gender'  => 'Gender: ' . ucfirst($this->gender ?? ''),
            default   => '—',
        };
    }
}
