<form method="POST" action="/test">
    @csrf

    <input type="text" name="username" placeholder="username">
    <input type="text" name="full_name" placeholder="fullname">
    <input type="password" name="password" placeholder="password">
    <input type="role" name="role" placeholder="role">
    <input type="status" name="status" placeholder="status">
    <button type="submit">submit</button>

</form>
@if (session('message'))
    {{ session('message') }}
@endif
