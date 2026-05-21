<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeePayment extends Model
{
    use HasUuids;

    protected $fillable = [
        'receipt_number',
        'student_id',
        'fee_type_id',
        'academic_session_id',
        'term_id',
        'total_amount',
        'amount_paid',
        'balance',
        'status',
        'payment_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'total_amount'  => 'decimal:2',
        'amount_paid'   => 'decimal:2',
        'balance'       => 'decimal:2',
        'payment_date'  => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }

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

    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    /**
     * Generate a unique receipt number: RCT-YYYY-XXXXXX
     */
    public static function generateReceiptNumber(): string
    {
        $year    = now()->year;
        $last    = static::whereYear('created_at', $year)->count();
        $sequence = str_pad($last + 1, 6, '0', STR_PAD_LEFT);
        return "RCT-{$year}-{$sequence}";
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
