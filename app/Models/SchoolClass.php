<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SchoolClass extends Model
{
    use HasUuids, HasFactory;
    protected $fillable = ['name', 'level'];

    /**
     * Relationships
     */
    public function sections(): HasMany
    {
        return $this->hasMany(ClassSection::class, 'school_class_id');
    }

    public function arms(): BelongsToMany
    {
        return $this->belongsToMany(ClassArm::class, 'class_sections', 'school_class_id', 'class_arm_id')
            ->using(ClassSection::class)
            ->withPivot('id', 'is_active')
            ->withTimestamps();
    }

    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(Student::class, ClassSection::class, 'school_class_id', 'class_section_id');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_section_subjects', 'class_section_id', 'subject_id')
            ->join('class_sections', 'class_section_subjects.class_section_id', '=', 'class_sections.id')
            ->where('class_sections.school_class_id', $this->id);
    }

    public function promotionRules(): HasMany
    {
        return $this->hasMany(PromotionRule::class, 'school_class_id');
    }
}
