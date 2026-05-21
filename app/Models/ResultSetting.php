<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ResultSetting extends Model
{
    use HasUuids;

    protected $fillable = ['key', 'data'];

    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Helper to get setting data by key
     */
    public static function getByKey(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->data : $default;
    }

    /**
     * Helper to set setting data by key
     */
    public static function setByKey(string $key, array $data)
    {
        return self::updateOrCreate(['key' => $key], ['data' => $data]);
    }
}
