<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PsychomotorSkillCategory extends Model
{
    use HasUuids;

    protected $fillable = ['name'];

    public function skills(): HasMany
    {
        return $this->hasMany(PsychomotorSkill::class, 'category_id');
    }
}
