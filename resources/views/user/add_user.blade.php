@vite('resources/css/app.css')

<x-navbar />


<div class="w-2/4 py-32 px-16">
    <div class="py-2">
        <h1 class="text-red-500 text-2xl">Add User</h1>
        <p>Add New User</p>
    </div>

    <form method="POST" action="/add-user">
        @csrf
        @if (session('message'))
            <p class="text-red-600"> {{ session('message') }}</p>
        @endif
        <div class="flex flex-col gap-5">
            <x-form_input type="text" name="full name" placeholder='full name' />
            <x-form_input type="username" name="username" placeholder='username' />
            <x-form_input type="password" name="password" placeholder='password' />
            <label for="role">Select Role:</label>
            <select name="role" id="role" class="p-2 capitalize">
                <option value="admin">admin</option>
                <option value="invigilator">invigilator</option>
                <option value="lecturer">lecturer</option>
            </select>

            <x-form_button text='add user' />
        </div>
    </form>
</div>
