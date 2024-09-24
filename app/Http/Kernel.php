<?php  

namespace App\Http;  

use Illuminate\Foundation\Http\Kernel as HttpKernel;  

class Kernel extends HttpKernel  
{  
    /**  
     * The application's global HTTP middleware stack.  
     *  
     * @var array  
     */  
    protected $middleware = [  
        \App\Http\Middleware\Cors
        // \App\Http\Middleware\TrustProxies::class,  
        // \App\Http\Middleware\RedirectIfAuthenticated::class,  
        // other middleware  
    ];  

    /**  
     * The application's route middleware.  
     *  
     * @var array  
     */  
    protected $routeMiddleware = [  
        'auth' => \App\Http\Middleware\Authenticate::class,  
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,  
        // other middleware  
    ];  

    /**  
     * The priority-sorted list of middleware classes.  
     *  
     * @var array  
     */  
    protected $middlewarePriority = [  
        // Middleware classes here, in the order you want them to run  
    ];  
}