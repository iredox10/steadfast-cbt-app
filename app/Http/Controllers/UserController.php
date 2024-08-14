<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    //
    public function addUser(Request $request)
    {
        $username = $request->input('username');
        $full_name = $request->input('full_name');
        $password = $request->input('password');
        $role = $request->input('role');
        if (isset($username, $full_name, $password, $role)) {
            // do validate the data first 
            $user = User::create([
                'username' => $username,
                'full_name' => $full_name,
                'password' => $password,
                'role' => $role,
            ]);
            return redirect()->back()->with('message', 'Form Submitted Succesfully!!');
        } else {
            return redirect()->back()->with('message', 'all fields have to be fill');
        }
    }

    public function getUsers()
    {
        $users = User::all();
        // return response()->json($users);
        return view('users', ['users' => $users]);
    }

    public function login(Request $request)
    {
        $user = User::where('username', $request->input('username'))->first();
        if (!$user) {
            return redirect()->back()->with('message', 'user not found!!');
        }
        if (Hash::check($request->input('password'), $user->password)) {
            // $request->session()->put('loggedUser', $user);
            if ($user->role == 'admin') {
                return redirect('/admin');
            } elseif ($user->role == 'lecture') {
                return redirect('/lecturer');
            } else {
                return redirect('/');
            }
        } else {
            return redirect()->back()->with('message', 'wrong password!!');
        }
    }

    public function getUser($id)
    {
        $user = User::find($id);
        if ($user->role == 'admin') {
            return view('user.admin');
        } elseif ($user->role == 'lecture') {
            return view('user.lecturer');
        } else {
            return view('user.login');
        }
        // return response()->json($user);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        $user->update($request->all());
        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully!']);
    }
}
