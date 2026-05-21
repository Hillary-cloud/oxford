<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class ClassArm extends Model
{
    use HasUuids, HasFactory;
    protected $fillable = [
        'name',
    ];

    /**
     * Relationships
     */
    public function sections(): HasMany
    {
        return $this->hasMany(ClassSection::class, 'class_arm_id');
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_sections', 'class_arm_id', 'school_class_id')
            ->using(ClassSection::class)
            ->withPivot('id', 'is_active')
            ->withTimestamps();
    }

    public function students()
    {
        // Through sections
        return $this->hasManyThrough(Student::class, ClassSection::class, 'class_arm_id', 'class_section_id');
    }

    public function results()
    {
        // Through sections
        return $this->hasManyThrough(Result::class, ClassSection::class, 'class_arm_id', 'class_section_id');
    }
}
