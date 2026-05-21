<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    use HasUuids, HasFactory;
    protected $fillable = [
        'name',
        'code',
        'type',
        'description',
    ];

    /**
     * Relationships
     */
    public function sections(): BelongsToMany
    {
        return $this->belongsToMany(ClassSection::class, 'class_section_subjects', 'subject_id', 'class_section_id')
            ->using(ClassSectionSubject::class)
            ->withTimestamps();
    }
}
