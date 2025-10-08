<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>HUK POLY - Computer Based Test Portal</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    @vite('resources/css/app.css')
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .hero-bg {
            background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("{{ asset('exam_img.png') }}") center/cover no-repeat;
            border-radius: 20px;
        }
        .feature-card {
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        .login-card {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 15px;
        }
        .btn-primary {
            background: linear-gradient(45deg, #1a202c, #2d3748);
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            background: linear-gradient(45deg, #2d3748, #1a202c);
            transform: translateY(-2px);
        }
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <img src="{{ asset('buk.png') }}" class="w-12 h-12" alt="HUK POLY Logo">
                <div>
                    <h1 class="text-xl font-bold text-gray-800">HUK POLY</h1>
                    <p class="text-xs text-gray-600">Computer Based Test Portal</p>
                </div>
            </div>
            <div>
                <button class="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition">
                    <i class="fas fa-headset mr-2"></i>Support
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-8">
        <!-- Hero Section -->
        <section class="mb-16">
            <div class="hero-bg p-8 md:p-12 text-white">
                <div class="max-w-2xl">
                    <h1 class="text-4xl md:text-5xl font-bold mb-4">Transforming Education Through <span class="text-blue-300">Digital Examinations</span></h1>
                    <p class="text-lg mb-8">Experience seamless, secure, and efficient computer-based testing at HUK POLY. Access your exams anytime, anywhere with our state-of-the-art platform.</p>
                    <div class="flex flex-wrap gap-4">
                        <button class="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                            <i class="fas fa-graduation-cap mr-2"></i>Student Login
                        </button>
                        <button class="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                            <i class="fas fa-chalkboard-teacher mr-2"></i>Lecturer Portal
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="mb-16">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Why Choose Our CBT Platform?</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Our cutting-edge platform offers a seamless examination experience with advanced features for students, lecturers, and administrators.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Feature 1 -->
                <div class="feature-card bg-white p-6 rounded-xl">
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <i class="fas fa-shield-alt text-blue-600 text-xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Secure Testing</h3>
                    <p class="text-gray-600">Advanced proctoring and security measures to ensure exam integrity.</p>
                </div>

                <!-- Feature 2 -->
                <div class="feature-card bg-white p-6 rounded-xl">
                    <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <i class="fas fa-bolt text-green-600 text-xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Instant Results</h3>
                    <p class="text-gray-600">Get real-time feedback and results immediately after submission.</p>
                </div>

                <!-- Feature 3 -->
                <div class="feature-card bg-white p-6 rounded-xl">
                    <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                        <i class="fas fa-mobile-alt text-purple-600 text-xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Any Device Access</h3>
                    <p class="text-gray-600">Take exams on any device with our responsive platform.</p>
                </div>

                <!-- Feature 4 -->
                <div class="feature-card bg-white p-6 rounded-xl">
                    <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                        <i class="fas fa-chart-line text-yellow-600 text-xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Performance Analytics</h3>
                    <p class="text-gray-600">Detailed analytics to track progress and identify improvement areas.</p>
                </div>
            </div>
        </section>

        <!-- Login Section -->
        <section class="flex flex-col lg:flex-row gap-8 items-center">
            <!-- Info Section -->
            <div class="flex-1">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Access Your Account</h2>
                <p class="text-gray-600 mb-6">Login to your student, lecturer, or administrator account to access your dashboard and manage exams.</p>
                
                <div class="space-y-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-800">For Students</h3>
                            <p class="text-gray-600">Access your scheduled exams, view results, and track your academic progress.</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-800">For Lecturers</h3>
                            <p class="text-gray-600">Create exams, manage question banks, and analyze student performance.</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-800">For Administrators</h3>
                            <p class="text-gray-600">Manage users, oversee exams, and configure system settings.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Login Form -->
            <div class="flex-1 w-full max-w-md">
                <div class="login-card bg-white p-8">
                    <div class="text-center mb-8">
                        <div class="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 floating">
                            <i class="fas fa-user-graduate text-gray-600 text-2xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800">Student Login</h2>
                        <p class="text-gray-600">Enter your credentials to access your account</p>
                    </div>

                    @if (session('message'))
                        <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            <i class="fas fa-exclamation-circle mr-2"></i>{{ session('message') }}
                        </div>
                    @endif

                    <form action="/login" method="POST">
                        @csrf
                        <div class="mb-5">
                            <label for="matricNo" class="block text-gray-700 font-medium mb-2">Matriculation Number</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-id-card text-gray-400"></i>
                                </div>
                                <input 
                                    type="text" 
                                    name="matricNo" 
                                    placeholder="Enter your matric number" 
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                >
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-lock text-gray-400"></i>
                                </div>
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Enter your password" 
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                >
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center">
                                <input 
                                    id="remember-me" 
                                    name="remember-me" 
                                    type="checkbox" 
                                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                >
                                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <div class="text-sm">
                                <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary w-full py-3 px-4 rounded-lg text-white font-semibold">
                            <i class="fas fa-sign-in-alt mr-2"></i>Login to Dashboard
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600 text-sm">
                            Don't have an account? 
                            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                                Contact Administrator
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                    <div class="flex items-center space-x-3">
                        <img src="{{ asset('buk.png') }}" class="w-10 h-10" alt="HUK POLY Logo">
                        <div>
                            <h3 class="text-lg font-bold">HUK POLY</h3>
                            <p class="text-gray-400 text-sm">Computer Based Test Portal</p>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-6">
                    <a href="#" class="text-gray-400 hover:text-white transition">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" class="text-gray-400 hover:text-white transition">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="text-gray-400 hover:text-white transition">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="#" class="text-gray-400 hover:text-white transition">
                        <i class="fab fa-linkedin-in"></i>
                    </a>
                </div>
            </div>
            <div class="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
                <p>&copy; {{ date('Y') }} HUK Polytechnic. All rights reserved. | Designed with <i class="fas fa-heart text-red-500"></i> for Education</p>
            </div>
        </div>
    </footer>
</body>
</html>