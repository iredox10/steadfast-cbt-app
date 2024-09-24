@vite('resources/css/app.css')

<div class="grid grid-cols-6 h-screen">
    <x-sidebar>
        <a href="#" class="text-start bg-secondary-color text-black rounded-l-3xl w-full p-3 ">Course</a>
        <a href="#" class="p-3">Questions</a>
        <a href="#" class="p-3">Candidates</a>
    </x-sidebar>
    <div class="p-5  col-span-5 ">
        <div class="capitalize">
            <h1>Course by - <span class="font-bold">Instructor name</span></h1>
        </div>
        <div class="grid grid-cols-4 gap-20 my-10 w-full ">
            <div class="bg-white drop-shadow-lg flex justify-center p-12">
                <a href="/instructor-add-question">Course One</a>
            </div>
            <div class="bg-white drop-shadow-lg flex justify-center p-12">
                <a href="/instructor-add-question">Course Two</a>
            </div>
            <div class="bg-white drop-shadow-lg flex justify-center p-12">
                <a href="/instructor-add-question">Course Three</a>
            </div>
            <div class="bg-white drop-shadow-lg flex justify-center p-12">
                <a href="/instructor-add-question">Course Four</a>
            </div>
        </div>
    </div>
</div>
