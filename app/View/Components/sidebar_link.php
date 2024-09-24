<?php  

namespace App\View\Components;  

use Closure;  
use Illuminate\Contracts\View\View;  
use Illuminate\View\Component;  

class sidebar_link extends Component  
{  
    public $text;  
    public $css;  

    /**  
     * Create a new component instance.  
     *  
     * @param string $text  
     * @param string $css  
     */  
    public function __construct($text, $css = '')  
    {  
        $this->text = $text;  
        $this->css = $css;  
    }  

    /**  
     * Get the view / contents that represent the component.  
     */  
    public function render(): View|Closure|string  
    {  
        return view('components.sidebar_link');  
    }  
}