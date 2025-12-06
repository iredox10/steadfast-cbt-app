<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure that Eloquent timestamps do not include microseconds,
        // which can cause "Data truncated for column 'updated_at'" errors in MySQL
        // when the database column type is DATETIME or TIMESTAMP without precision.
        Model::preventAccessingMissingAttributes();
        Model::preventSilentlyDiscardingAttributes();
        Model::reguard();
    }
}
