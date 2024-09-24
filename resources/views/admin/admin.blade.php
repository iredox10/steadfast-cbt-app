@vite('resources/css/app.css')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />

<div class="grid grid-cols-6 h-screen">
    <x-sidebar>
        <button class="text-start bg-secondary-color text-black rounded-l-3xl w-full p-3 ">Course</button>
        <button class="p-3">instructors</button>
        <button class="p-3">invigilators</button>
    </x-sidebar>
    <div class="col-span-5 p-5">
        <div class="flex justify-between  w-full my-5">
            <div>
                <h1 class="text-2xl font-bold">Students</h1>
                <p>student details</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="bg-white flex items-center gap-3 p-2 rounded-full">
                    <input type="search" name="search" id="search" class="w-full p-1 border-none outline-none px-5"
                        placeholder="Search....">
                    <button>
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <i class="fas fa-filter"></i>
                <div class="flex gap-4 items-center">
                    {{-- <img src="" alt="profile picture" class=""> --}}
                    <i class="fas fa-user text-2xl border-2 border-black p-2 rounded-full"></i>
                    <button class="transition ease-in-out delay-75 p-1 arrow relative hover:mt-2">
                        <i class="fas fa-arrow-down"></i>
                        <button id="logout" class="hidden absolute top-[5rem] -right-0 p-2  h-10 bg-white shadow-lg">
                           logout 
                        </button>
                    </button>
                </div>
            </div>
        </div>
        <div>
            <div class="bg-white rounded-lg shadow-md p-4">
                <table class="min-w-full border-collapse overflow-hidden rounded-lg">

                    <thead>
                        <tr class="bg-gray-100">
                            <th class="py-3 px-4 text-left text-gray-600 font-medium rounded-tl-lg">Id</th>
                            <th class="py-3 px-4 text-left text-gray-600 font-medium">FullName</th>
                            <th class="py-3 px-4 text-left text-gray-600 font-medium">Department</th>
                            <th class="py-3 px-4 text-left text-gray-600 font-medium">Programme</th>
                            <th class="py-3 px-4 text-left text-gray-600 font-medium">Matriculation Number</th>
                            <th class="py-3 px-4 text-left text-gray-600 font-medium rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Table rows -->
                        <tr class="border-b">
                            <td class="py-3 px-4 text-gray-700">1</td>
                            <td class="py-3 px-4 text-gray-700">Idris Adam Idris</td>
                            <td class="py-3 px-4 text-gray-700">Computer Science</td>
                            <td class="py-3 px-4 text-gray-700">Computer Science</td>
                            <td class="py-3 px-4 text-gray-700">UGC/COM/21/0019</td>
                            <td class="py-3 px-4 text-gray-700">
                                <button id="show_detail" class="p-2 "> <i class="fas fa-eye"></i></button>
                                <button id="show_detail"class="p-2"> <i class="fas fa-pen-to-square"></i></button>
                            </td>
                        </tr>
                        <!-- Repeat the row as needed -->
                        <tr class="border-b">
                            <td class="py-3 px-4 text-gray-700">2</td>
                            <td class="py-3 px-4 text-gray-700">Idris Adam Idris</td>
                            <td class="py-3 px-4 text-gray-700">Computer Science</td>
                            <td class="py-3 px-4 text-gray-700">Computer Science</td>
                            <td class="py-3 px-4 text-gray-700">UGC/COM/21/0019</td>
                            <td class="py-3 px-4 text-gray-700">
                                <button id="show_detail"class="p-2 "> <i class="fas fa-eye"></i></button>
                                <button id="show_detail"class="p-2"> <i class="fas fa-pen-to-square"></i></button>
                            </td>
                        </tr>
                        <!-- Add more rows as necessary -->
                        <tr>
                            <td class="py-3 px-4 text-gray-700 rounded-bl-lg">3</td>
                            <td class="py-3 px-4 text-gray-700">Idris Adam Idris</td>
                            <td class="py-3 px-4 text-gray-700">Computer Science</td>
                            <td class="py-3 px-4 text-gray-700">Computer Science</td>
                            <td class="py-3 px-4 text-gray-700">UGC/COM/21/0019</td>
                            <td class="py-3 px-4 text-gray-700 rounded-br-lg">
                                <button id="show_detail" class="p-2 "> <i class="fas fa-eye"></i></button>
                                <button id="show_detail" class="p-2"> <i class="fas fa-pen-to-square"></i></button>
                            </td>
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
    <div id="detail_model" class="hidden w-[20rem] p-4 bg-white  drop-shadow right-[2rem] top-[8rem] absolute">
        <div class="flex items-center justify-between">
            <div>
                <i class="fas fa-user border-2 border-black rounded-full p-2"></i>
            </div>
            <div>
                <h1 class="font-bold">Idris adam</h1>
                <p>Hnd/com/21/0109</p>
            </div>
            <button id="close_model" class="">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div id="modelBtnContainer" class="flex items-center justify-between my-6">
            <button id="infoBtn"
                class="capitalize font-bold relative before:contents-[' '] before:block before:w-8 before:h-1 before:bg-black before:-bottom-1 before:absolute">info</button>
            <button id="examBtn" class="capitalize font-bold">Exam</button>
            <button id="coursesBtn" class="capitalize font-bold ">Courses</button>
        </div>
        <div>
            <div class="my-4" id="detail">
                <p class="mb-5 text-sm"><span class="font-bold pb-4">FullName: </span>Idris Adam Idris</p>
                <p class="mb-5 text-sm"><span class="font-bold pb-4">Department: </span>Computer Science</p>
                <p class="mb-5 text-sm"><span class="font-bold pb-4">Programme: </span>Computer Science</p>
                <p class="mb-5 text-sm"><span class="font-bold pb-4">Matric Number: </span> HND/COM/21/0019</p>
            </div>
            <div class="my-4 hidden" id="examDetail">exam</div>
            <div class="my-4 hidden" id="coursesDetail">courses</div>
        </div>
    </div>
</div>
</div>


<script>
    const showDetailBtns = [...document.querySelectorAll('#show_detail')]
    const detailModel = document.querySelector('#detail_model')
    const closeModelBtn = document.querySelector('#close_model')
    const modelBtnContainer = document.querySelector('#modelBtnContainer')
    const modelBtns = document.querySelectorAll('#modelBtn')
    const studentDetail = document.querySelector('#detail')
    const studentExam = document.querySelector('#examDetail')
    const studentCourses = document.querySelector('#coursesDetail')
    const arrow = document.querySelector('.arrow')

    arrow.addEventListener('click', () =>{
        const logoutBtn = document.querySelector('#logout')
        logoutBtn.classList.toggle('hidden')
    })

    showDetailBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            detailModel.classList.toggle('hidden')
        })
    })
    closeModelBtn.addEventListener('click', () => {
        detailModel.classList.add('hidden')
    })


    modelBtnContainer.addEventListener('click', e => {
        const examBtn = document.querySelector('#examBtn')
        const infoBtn = document.querySelector('#InfoBtn')
        const coursesBtn = document.querySelector('#coursesBtn')
        switch (e.target.id) {
            case 'examBtn':
                studentDetail.classList.add('hidden')
                studentCourses.classList.add('hidden')
                studentExam.classList.remove('hidden')
                examBtn.classList.add('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                infoBtn.classList.remove('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                coursesBtn.classList.remove('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                break
            case 'infoBtn':
                studentExam.classList.add('hidden')
                studentCourses.classList.add('hidden')
                studentDetail.classList.remove('hidden')
                console.log('info')
                infoBtn.classList.add('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                examBtn.classList.remove('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                coursesBtn.classList.remove('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                break
            case 'coursesBtn':
                studentExam.classList.add('hidden')
                studentCourses.classList.remove('hidden')
                studentDetail.classList.add('hidden')
                console.log('courses')
                coursesBtn.classList.add('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                infoBtn.classList.remove('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                examBtn.classList.remove('relative', 'before:content-[""]', 'before:block', 'before:w-8',
                    'before:h-1', 'before:bg-black', 'before:-bottom-1', 'before:absolute');
                break
            default:
                break
        }
    })
</script>
