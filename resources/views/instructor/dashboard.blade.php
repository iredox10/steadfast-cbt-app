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
    
    <div class="p-5 col-span-5 bg-gray-100">
        <div class="flex justify-between items-center mb-8">
            <div class="capitalize">
                <h1 class="text-2xl font-bold text-gray-800">Courses by - <span class="text-blue-600">Instructor Name</span></h1>
            </div>
            <div class="flex items-center gap-3">
                <div class="relative">
                    <input type="search" placeholder="Search courses..." 
                        class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <div class="flex items-center gap-4">
                    <i class="fas fa-bell text-xl text-gray-600"></i>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-user text-xl text-gray-600"></i>
                        <i class="fas fa-chevron-down text-sm text-gray-600"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            <!-- Course Card 1 -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Computer Science 101</h3>
                            <p class="text-gray-600 text-sm mt-1">Introduction to Programming</p>
                        </div>
                        <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <span>24 Questions</span>
                        </div>
                        <div class="flex gap-2">
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <span class="text-xs text-gray-500">Last updated: 2 days ago</span>
                    <a href="/instructor-add-question" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Manage <i class="fas fa-arrow-right text-xs ml-1"></i>
                    </a>
                </div>
            </div>
            
            <!-- Course Card 2 -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Mathematics 201</h3>
                            <p class="text-gray-600 text-sm mt-1">Calculus Fundamentals</p>
                        </div>
                        <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <span>18 Questions</span>
                        </div>
                        <div class="flex gap-2">
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <span class="text-xs text-gray-500">Last updated: 1 week ago</span>
                    <a href="/instructor-add-question" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Manage <i class="fas fa-arrow-right text-xs ml-1"></i>
                    </a>
                </div>
            </div>
            
            <!-- Course Card 3 -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Physics 301</h3>
                            <p class="text-gray-600 text-sm mt-1">Mechanics & Thermodynamics</p>
                        </div>
                        <span class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Draft</span>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <span>12 Questions</span>
                        </div>
                        <div class="flex gap-2">
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <span class="text-xs text-gray-500">Last updated: 3 weeks ago</span>
                    <a href="/instructor-add-question" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Manage <i class="fas fa-arrow-right text-xs ml-1"></i>
                    </a>
                </div>
            </div>
            
            <!-- Course Card 4 -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Chemistry 401</h3>
                            <p class="text-gray-600 text-sm mt-1">Organic Chemistry Basics</p>
                        </div>
                        <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">Archived</span>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <span>35 Questions</span>
                        </div>
                        <div class="flex gap-2">
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <span class="text-xs text-gray-500">Last updated: 2 months ago</span>
                    <a href="/instructor-add-question" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Manage <i class="fas fa-arrow-right text-xs ml-1"></i>
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Stats Section -->
        <div class="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <i class="fas fa-book text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-2xl font-bold text-gray-800">12</h3>
                        <p class="text-gray-600">Total Courses</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-lg bg-green-100 text-green-600">
                        <i class="fas fa-question-circle text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-2xl font-bold text-gray-800">89</h3>
                        <p class="text-gray-600">Total Questions</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                        <i class="fas fa-users text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-2xl font-bold text-gray-800">245</h3>
                        <p class="text-gray-600">Students</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-lg bg-purple-100 text-purple-600">
                        <i class="fas fa-chart-line text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-2xl font-bold text-gray-800">92%</h3>
                        <p class="text-gray-600">Avg. Score</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>