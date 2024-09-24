@vite('resources/css/app.css')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
<table class="w-full table-auto">
    <tr class="capitalize">
        <th>id</th>
        <th>fullname</th>
        <th>department</th>
        <th>programme</th>
        <th>marticulation number</th>
        <th>actions</th>
    </tr>
    <div class="flex gap-4">
        <tr class="capitalize bg-secondary-color/50  p-6 rounded-full drop-shadow-xl">
            <td class="text-center">1</td>
            <td class="text-center">idris adam idris</td>
            <td class="text-center">computer science</td>
            <td class="text-center">computer science</td>
            <td class="text-center">Hnd/com/21/0109</td>

            <td class="text-center">
                <button class="p-1 bg-red-400"> <i class="fas fa-eye"></i></button>
                <button> <i class="fas fa-pen-to-square"></i></button>
            </td>

        </tr>
        <tr class="capitalize bg-secondary-color  p-6 rounded-full drop-shadow-xl">
            <td class="text-center">1</td>
            <td class="text-center">idris adam idris</td>
            <td class="text-center">computer science</td>
            <td class="text-center">computer science</td>
            <td class="text-center">Hnd/com/21/0109</td>
            <td class="text-center">
                <button class="p-1 bg-red-400"> <i class="fas fa-eye"></i></button>
                <button> <i class="fas fa-pen-to-square"></i></button>
            </td>
    </div>
</table>
<div class="grid grid-cols-6 h-screen">
    <x-sidebar>
    </x-sidebar>

    <div class="col-span-5 p-5">
        <div class="bg-white rounded-lg shadow-md p-4">
            <table class="min-w-full border-collapse overflow-hidden rounded-lg">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="py-3 px-4 text-left text-gray-600 font-medium rounded-tl-lg rounded-bl-lg">Id</th>
                        <th class="py-3 px-4 text-left text-gray-600 font-medium">FullName</th>
                        <th class="py-3 px-4 text-left text-gray-600 font-medium">Department</th>
                        <th class="py-3 px-4 text-left text-gray-600 font-medium">Programme</th>
                        <th class="py-3 px-4 text-left text-gray-600 font-medium">Matriculation Number</th>
                        <th class="py-3 px-4 text-left text-gray-600 font-medium rounded-tr-lg">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Table rows -->
                    <tr class=" ">
                        <td class="py-3 px-4 text-gray-700 border-2 rounded-lt-lg ">1</td>
                        <td class="py-3 px-4 text-gray-700">Idris Adam Idris</td>
                        <td class="py-3 px-4 text-gray-700">Computer Science</td>
                        <td class="py-3 px-4 text-gray-700">Computer Science</td>
                        <td class="py-3 px-4 text-gray-700">UGC/COM/21/0019</td>
                        <td class="py-3 px-4 text-gray-700">...</td>
                    </tr>
                    <!-- Repeat the row as needed -->
                    <tr class="border-b">
                        <td class="py-3 px-4 text-gray-700">1</td>
                        <td class="py-3 px-4 text-gray-700">Idris Adam Idris</td>
                        <td class="py-3 px-4 text-gray-700">Computer Science</td>
                        <td class="py-3 px-4 text-gray-700">Computer Science</td>
                        <td class="py-3 px-4 text-gray-700">UGC/COM/21/0019</td>
                        <td class="py-3 px-4 text-gray-700">...</td>
                    </tr>
                    <!-- Add more rows as necessary -->
                    <tr>
                        <td class="py-3 px-4 text-gray-700 rounded-bl-lg">1</td>
                        <td class="py-3 px-4 text-gray-700">Idris Adam Idris</td>
                        <td class="py-3 px-4 text-gray-700">Computer Science</td>
                        <td class="py-3 px-4 text-gray-700">Computer Science</td>
                        <td class="py-3 px-4 text-gray-700">UGC/COM/21/0019</td>
                        <td class="py-3 px-4 text-gray-700 rounded-br-lg">...</td>
                    </tr>
                </tbody>
            </table>
            <!-- Pagination -->
            <div class="mt-4 flex justify-between items-center">
                <span class="text-sm text-gray-600">Showing 6-21 of 1000</span>
                <div class="flex space-x-1 text-gray-600">
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">1</a>
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">2</a>
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">3</a>
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">4</a>
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">5</a>
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">6</a>
                    <a href="#" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">7</a>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
<div class="flex my-5 justify-between">
            <p>showing 6 -21 of 1000</p>
            <div class="flex gap-4">
                <button>
                    << /button>
                        <button>1</button>
                        <button>2</button>
                        <button>3</button>
                        <button>4</button>
                        <button>5</button>
                        <button>6</button>
                        <button>7</button>
                        <button>></button>
            </div>
        </div>