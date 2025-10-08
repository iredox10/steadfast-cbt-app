<div class="flex flex-col h-screen bg-black text-white">
    <div class="flex flex-col items-center my-6">
        <img src="{{ asset('buk.png') }}" class="w-16 h-16 object-contain" alt="Logo">
        <h1 class="text-white font-bold mt-2">HUK POLY</h1>
    </div>
    
    <div class="flex flex-col justify-between h-full">
        <div class="px-4 py-6">
            <nav class="space-y-2">
                {{ $slot }}
            </nav>
        </div>
        
        <div class="p-4 border-t border-gray-800">
            <a href="#" class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-300">
                <i class="fas fa-question-circle mr-3"></i>
                <span>Help Center</span>
            </a>
            <a href="#" class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition duration-300 mt-2">
                <i class="fas fa-right-from-bracket mr-3"></i>
                <span>Log out</span>
            </a>
        </div>
    </div>
</div>