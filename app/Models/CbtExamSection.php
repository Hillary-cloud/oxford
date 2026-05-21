<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CbtExamSection extends Pivot
{
    protected $table = 'cbt_exam_sections';
    public $incrementing = false;
    protected $keyType = 'string';
}
