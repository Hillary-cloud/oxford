<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'fee_payment_id',
        'payment_method',
        'amount',
        'school_account_id',
        'reference_number',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function feePayment(): BelongsTo
    {
        return $this->belongsTo(FeePayment::class);
    }

    public function schoolAccount(): BelongsTo
    {
        return $this->belongsTo(SchoolAccount::class);
    }
}
