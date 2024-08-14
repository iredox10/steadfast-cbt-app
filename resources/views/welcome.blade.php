@vite('resources/css/app.css')

<x-navbar>
</x-navbar>


<div class="w-2/4 py-[5rem] px-16">
    <div class="py-2">
        <h1 class="text-black font-bold  text-8xl">Welcome</h1>
        <p class="text-black capitalize ml-4 text-xl ">login to your account</p>
    </div>
    @if (session('message'))
        <p class="text-red-600 font-bold capitalize"> {{ session('message') }}</p>
    @endif

    <form action="/login" method="POST">
        @csrf
        <div class="flex flex-col my-4">
            <div class="mb-3 ">
                <label for="matricNo" class="m-0">Matriculation Number</label>
                <input type="text" name="matricNo" placeholder="Enter Your Matriculation Number"
                    class="capitalize p-4 w-full">
            </div>
            <div class="mb-3">
                <label for="password" class="w-full">Password</label>
                <input type="password" name="password" placeholder="Enter Your Password" class='w-full capitalize p-4'>
            </div>
            {{-- <a href="">forget passwor</a> --}}
            <button type='submit' class="bg-black px-4 py-2 text-white text-lg capitalize ">login</button>
        </div>
    </form>

</div>
