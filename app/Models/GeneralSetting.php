<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GeneralSetting extends Model
{
    use HasUuids;

    protected $fillable = ['key', 'payload'];

    protected $casts = [
        'payload' => 'array',
    ];

    /**
     * Get setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->payload : $default;
    }

    /**
     * Set setting value by key.
     */
    public static function set(string $key, $value)
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['payload' => $value]
        );
    }
}
