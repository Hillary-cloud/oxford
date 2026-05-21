<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PromotionRule extends Model
{
    use HasUuids;

    protected $fillable = [
        'academic_session_id',
        'school_class_id',
        'method',
        'weights',
        'min_average',
        'trial_min_average',
        'max_failed_subjects',
        'core_subject_ids',
        'is_avg_enabled',
        'is_core_pass_enabled',
        'is_core_fail_limit_enabled',
        'pass_other_subjects_count',
        'is_rule1_termly',
        'is_rule1_annual',
        'is_rule2_termly',
        'is_rule2_annual',
        'is_rule3_termly',
        'is_rule3_annual',
        'is_rule4_termly',
        'is_rule4_annual',
    ];

    protected $casts = [
        'weights' => 'json',
        'core_subject_ids' => 'json',
        'min_average' => 'decimal:2',
        'trial_min_average' => 'decimal:2',
        'is_avg_enabled' => 'boolean',
        'is_core_pass_enabled' => 'boolean',
        'is_core_fail_limit_enabled' => 'boolean',
        'pass_other_subjects_count' => 'integer',
        'max_failed_subjects' => 'integer',
        'is_rule1_termly' => 'boolean',
        'is_rule1_annual' => 'boolean',
        'is_rule2_termly' => 'boolean',
        'is_rule2_annual' => 'boolean',
        'is_rule3_termly' => 'boolean',
        'is_rule3_annual' => 'boolean',
        'is_rule4_termly' => 'boolean',
        'is_rule4_annual' => 'boolean',
    ];

    public function session()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }
}
