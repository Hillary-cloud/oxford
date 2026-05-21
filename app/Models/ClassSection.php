<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ClassSection extends Pivot
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'class_sections';

    protected $fillable = [
        'school_class_id',
        'class_arm_id',
        'form_teacher_id',
        'is_active',
    ];

    /**
     * Relationships
     */
    public function formTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'form_teacher_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function classArm(): BelongsTo
    {
        return $this->belongsTo(ClassArm::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_section_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'class_section_id');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_section_subjects', 'class_section_id', 'subject_id')
            ->using(ClassSectionSubject::class)
            ->withTimestamps();
    }

    public function sectionSubjects(): HasMany
    {
        return $this->hasMany(ClassSectionSubject::class, 'class_section_id');
    }

    /**
     * Get the full name (e.g., Grade 1A)
     */
    public function getFullNameAttribute(): string
    {
        $className = $this->schoolClass->name ?? '';
        $armName = $this->classArm->name ?? '';

        if (empty($armName) || strtolower($armName) === 'no arm') {
            return $className;
        }

        return $className . ' ' . $armName;
    }
}
