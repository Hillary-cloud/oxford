<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CbtQuestion extends Model
{
    use HasUuids;

    protected $fillable = [
        'cbt_exam_id', 'question_text', 'question_type',
        'options', 'correct_answer', 'points', 'display_order'
    ];

    protected $casts = [
        'options' => 'array',
        // correct_answer might be a string or JSON depending on type, 
        // but often we keep it as string/text if it's a simple key (like 'A') 
        // or json_decode manually if needed. 
        // For array compatibility:
        'correct_answer' => 'array', 
    ];

    protected $hidden = [
        'correct_answer', // Hide from array serialization by default for security
    ];

    public function exam()
    {
        return $this->belongsTo(CbtExam::class, 'cbt_exam_id');
    }
}
