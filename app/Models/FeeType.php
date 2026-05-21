<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeType extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'amount',
        'is_recurring',
        'recurring_interval',
        'academic_session_id',
        'term_id',
        'due_date',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'is_recurring' => 'boolean',
        'is_active'    => 'boolean',
        'due_date'     => 'date',
    ];

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(FeeAssignment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Total amount collected across all payments for this fee type.
     */
    public function totalCollected(): float
    {
        return (float) $this->payments()->sum('amount_paid');
    }
}
