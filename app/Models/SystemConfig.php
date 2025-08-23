<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    use HasFactory;

    protected $table = 'system_config';

    protected $fillable = [
        'key',
        'value',
        'type',
        'description'
    ];

    /**
     * Get a system configuration value by key
     */
    public static function get($key, $default = null)
    {
        $config = self::where('key', $key)->first();
        
        if (!$config) {
            return $default;
        }

        return self::castValue($config->value, $config->type);
    }

    /**
     * Set a system configuration value
     */
    public static function set($key, $value, $type = 'string', $description = null)
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'description' => $description
            ]
        );
    }

    /**
     * Cast the value to the appropriate type
     */
    private static function castValue($value, $type)
    {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $value;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    /**
     * Get the current global active session
     */
    public static function getGlobalActiveSession()
    {
        $sessionId = self::get('global_active_session_id');
        
        if ($sessionId) {
            return Acd_session::find($sessionId);
        }
        
        return null;
    }

    /**
     * Set the global active session
     */
    public static function setGlobalActiveSession($sessionId)
    {
        return self::set('global_active_session_id', $sessionId, 'integer', 'The currently active academic session for the entire system');
    }
}space App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    //
}
