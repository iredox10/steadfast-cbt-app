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
        $user = User::where('email', $request->input('email'))->first();
        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (Hash::check($request->input('password'), $user->password)) {
            // Generate token for API authentication
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'level_id' => $user->level_id,
                'level' => $user->level,
                'token' => $token,
                'force_password_change' => (bool) $user->force_password_change,
            ], 200);
        } else {
            return response()->json(['error' => 'Wrong password'], 400);
        }
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'new_password' => 'required|min:6',
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->new_password);
        $user->force_password_change = false;
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function getCurrentUser(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Load the level relationship
        $user->load('level');

        return response()->json([
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'role' => $user->role,
            'level_id' => $user->level_id,
            'level' => $user->level,
            'status' => $user->status,
        ]);
    }

    public function getNotifications(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'unread_count' => $user->unreadNotifications->count(),
            'notifications' => $user->notifications()->take(20)->get(),
        ]);
    }

    public function markNotificationRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllNotificationsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All marked as read']);
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
