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
                <h1 class="text-2xl font-bold text-gray-800">Course - <span class="text-blue-600">Computer Science 101</span></h1>
                <div class="flex gap-2">
                    <button class="bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i> Back to Courses
                    </button>
                </div>
            </div>
            <p class="text-gray-600 mt-1">Manage questions for this course</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Questions List Section -->
            <div class="bg-white rounded-xl shadow-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">Questions Bank</h2>
                    <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">24 Questions</span>
                </div>
                
                <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    <!-- Question Item 1 -->
                    <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-300">
                        <p class="text-gray-800 font-medium mb-3">What is the time complexity of binary search algorithm?</p>
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2">
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Multiple Choice</span>
                                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Medium</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                    <i class="fas fa-pen-to-square"></i>
                                </button>
                                <button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Question Item 2 -->
                    <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-300">
                        <p class="text-gray-800 font-medium mb-3">Explain the concept of object-oriented programming with real-world examples.</p>
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2">
                                <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Long Answer</span>
                                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Hard</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                    <i class="fas fa-pen-to-square"></i>
                                </button>
                                <button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Question Item 3 -->
                    <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-300">
                        <p class="text-gray-800 font-medium mb-3">Which of the following is NOT a valid Python data type?</p>
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2">
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Multiple Choice</span>
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Easy</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                    <i class="fas fa-pen-to-square"></i>
                                </button>
                                <button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add Question Form Section -->
            <div class="bg-white rounded-xl shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">Add New Question</h2>
                    <div class="flex gap-2">
                        <button class="btn-secondary px-4 py-2 rounded-lg font-semibold">
                            Save Draft
                        </button>
                        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                            Publish
                        </button>
                    </div>
                </div>
                
                <form>
                    <div class="mb-5">
                        <label class="block text-gray-700 font-medium mb-2" for="question-type">
                            Question Type
                        </label>
                        <select id="question-type" class="input-field bg-white">
                            <option>Multiple Choice</option>
                            <option>True/False</option>
                            <option>Short Answer</option>
                            <option>Long Answer</option>
                        </select>
                    </div>
                    
                    <div class="mb-5">
                        <label class="block text-gray-700 font-medium mb-2" for="question">
                            Question
                        </label>
                        <textarea id="question" rows="3" placeholder="Enter your question here..." 
                            class="input-field"></textarea>
                    </div>
                    
                    <div class="mb-5">
                        <label class="block text-gray-700 font-medium mb-2" for="correct-answer">
                            Correct Answer
                        </label>
                        <textarea id="correct-answer" rows="2" placeholder="Enter the correct answer..." 
                            class="input-field"></textarea>
                    </div>
                    
                    <div class="mb-5">
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-gray-700 font-medium">
                                Options
                            </label>
                            <button type="button" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                <i class="fas fa-plus mr-1"></i> Add Option
                            </button>
                        </div>
                        
                        <div class="space-y-3">
                            <div class="flex items-center">
                                <div class="flex items-center h-5">
                                    <input id="option1" type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                </div>
                                <div class="ml-3 w-full">
                                    <input type="text" placeholder="Option 1" class="input-field">
                                </div>
                            </div>
                            
                            <div class="flex items-center">
                                <div class="flex items-center h-5">
                                    <input id="option2" type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                </div>
                                <div class="ml-3 w-full">
                                    <input type="text" placeholder="Option 2" class="input-field">
                                </div>
                            </div>
                            
                            <div class="flex items-center">
                                <div class="flex items-center h-5">
                                    <input id="option3" type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                </div>
                                <div class="ml-3 w-full">
                                    <input type="text" placeholder="Option 3" class="input-field">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                Difficulty Level
                            </label>
                            <div class="flex gap-2">
                                <button type="button" class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition">
                                    Easy
                                </button>
                                <button type="button" class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200 transition">
                                    Medium
                                </button>
                                <button type="button" class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium hover:bg-red-200 transition">
                                    Hard
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                            Add Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Question Preview Modal -->
    <div id="question-model" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Question Preview</h3>
                    <button id="close-model" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-bold text-gray-700 mb-2">Question:</h4>
                    <p class="text-gray-800">What is the time complexity of binary search algorithm?</p>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-bold text-gray-700 mb-2">Options:</h4>
                    <div class="space-y-2">
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center h-5">
                                <input type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                            </div>
                            <label class="ml-3 text-gray-700">O(n)</label>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center h-5">
                                <input type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" checked>
                            </div>
                            <label class="ml-3 text-gray-700 font-medium">O(log n)</label>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center h-5">
                                <input type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                            </div>
                            <label class="ml-3 text-gray-700">O(n log n)</label>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center h-5">
                                <input type="radio" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                            </div>
                            <label class="ml-3 text-gray-700">O(1)</label>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-bold text-gray-700 mb-2">Explanation:</h4>
                    <p class="text-gray-700">Binary search has a time complexity of O(log n) because it divides the search space in half with each iteration.</p>
                </div>
                
                <div class="flex justify-end gap-3">
                    <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        Edit Question
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Modal functionality
    const viewQuestionBtns = document.querySelectorAll('#view-question');
    const closeModel = document.querySelector('#close-model');
    const questionModel = document.querySelector('#question-model');
    
    viewQuestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            questionModel.classList.remove('hidden');
        });
    });
    
    closeModel.addEventListener('click', () => {
        questionModel.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === questionModel) {
            questionModel.classList.add('hidden');
        }
    });
</script>