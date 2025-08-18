@vite('resources/css/app.css')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />

<div class="grid grid-cols-6 h-screen">
    <x-sidebar>
        <a href="#" class="text-start bg-white text-black rounded-l-3xl w-full p-3 font-semibold">Course</a>
        <a href="#" class="p-3 hover:bg-gray-800 transition duration-300">Questions</a>
        <a href="#" class="p-3 hover:bg-gray-800 transition duration-300">Candidates</a>
    </x-sidebar>
    
    <div class="col-span-5 p-5 bg-gray-100">
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold text-gray-800">Exam - <span class="text-blue-600">Midterm Test</span></h1>
                <div class="flex gap-2">
                    <button class="bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition flex items-center">
                        <i class="fas fa-cog mr-2"></i> Settings
                    </button>
                    <button class="btn-secondary px-4 py-2 rounded-lg font-semibold">
                        Start Exam
                    </button>
                </div>
            </div>
            <p class="text-gray-600 mt-1">Computer Science 101 - 25 questions, 60 minutes</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Exam Info Section -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Exam Questions</h2>
                
                <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    <!-- Question 1 -->
                    <div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div class="flex justify-between items-start mb-2">
                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Question 1</span>
                            <span class="text-gray-500 text-sm">2 points</span>
                        </div>
                        <p class="text-gray-800 font-medium mb-3">What is the time complexity of binary search algorithm?</p>
                        <div class="space-y-2">
                            <div class="flex items-center p-2 rounded hover:bg-white">
                                <input type="radio" name="q1" id="q1a" class="w-4 h-4 text-blue-600">
                                <label for="q1a" class="ml-2 text-gray-700">O(n)</label>
                            </div>
                            <div class="flex items-center p-2 rounded hover:bg-white">
                                <input type="radio" name="q1" id="q1b" class="w-4 h-4 text-blue-600">
                                <label for="q1b" class="ml-2 text-gray-700">O(log n)</label>
                            </div>
                            <div class="flex items-center p-2 rounded hover:bg-white">
                                <input type="radio" name="q1" id="q1c" class="w-4 h-4 text-blue-600">
                                <label for="q1c" class="ml-2 text-gray-700">O(n log n)</label>
                            </div>
                            <div class="flex items-center p-2 rounded hover:bg-white">
                                <input type="radio" name="q1" id="q1d" class="w-4 h-4 text-blue-600">
                                <label for="q1d" class="ml-2 text-gray-700">O(1)</label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Question 2 -->
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                            <span class="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">Question 2</span>
                            <span class="text-gray-500 text-sm">3 points</span>
                        </div>
                        <p class="text-gray-800 font-medium mb-3">Explain the concept of object-oriented programming.</p>
                        <textarea placeholder="Type your answer here..." class="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                </div>
                
                <div class="flex justify-between mt-6">
                    <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        <i class="fas fa-arrow-left mr-2"></i> Previous
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Next <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
            
            <!-- Exam Summary Section -->
            <div class="bg-white rounded-xl shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Exam Summary</h2>
                
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-600">Time Remaining</span>
                        <span class="font-bold text-red-600">45:32</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: 25%"></div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-700 mb-3">Questions Overview</h3>
                    <div class="grid grid-cols-5 gap-2">
                        <button class="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 font-medium">1</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">2</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">3</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">4</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">5</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">6</button>
                        <button class="w-10 h-10 rounded-lg bg-green-100 text-green-800 font-medium">7</button>
                        <button class="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-800 font-medium">8</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">9</button>
                        <button class="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 font-medium">10</button>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-700 mb-3">Legend</h3>
                    <div class="space-y-2">
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                            <span class="text-sm text-gray-600">Current Question</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-green-100 rounded mr-2"></div>
                            <span class="text-sm text-gray-600">Answered</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
                            <span class="text-sm text-gray-600">Marked for Review</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                            <span class="text-sm text-gray-600">Not Answered</span>
                        </div>
                    </div>
                </div>
                
                <button class="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-300">
                    Submit Exam
                </button>
            </div>
        </div>
    </div>
</div>