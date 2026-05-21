<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeGroup extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
    ];

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_fee_groups')
            ->withTimestamps();
    }

    public function feeAssignments(): HasMany
    {
        return $this->hasMany(FeeAssignment::class);
    }
}
