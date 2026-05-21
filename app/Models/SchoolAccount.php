<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolAccount extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'account_number',
        'bank_name',
        'account_type',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    /**
     * Only accounts that accept non-cash payments (have account details).
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
