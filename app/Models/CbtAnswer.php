<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CbtAnswer extends Model
{
    use HasUuids;

    protected $fillable = [
        'cbt_attempt_id', 'cbt_question_id',
        'answer', 'is_correct', 'score_earned'
    ];

    public function attempt()
    {
        return $this->belongsTo(CbtAttempt::class, 'cbt_attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(CbtQuestion::class, 'cbt_question_id');
    }
}
