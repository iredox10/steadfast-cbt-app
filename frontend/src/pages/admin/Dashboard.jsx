import { FaEye, FaPenToSquare } from "react-icons/fa6";
import Sidebar from "../../components/Sidebar";
import Student from "../Student";

const AdminDashboard = () => {
    return (
        <div class="grid grid-cols-6 gap-4 min-h-screen">
            <Sidebar>
                
            </Sidebar>
            <div class="col-span-5 p-5">
                <div class="flex justify-between  w-full my-5">
                    <div>
                        <h1 class="text-2xl font-bold">Students</h1>
                        <p>student details</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="bg-white flex items-center gap-3 p-2 rounded-full">
                            <input
                                type="search"
                                name="search"
                                id="search"
                                class="w-full p-1 border-none outline-none px-5"
                                placeholder="Search...."
                            />
                            <button>
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                        <i class="fas fa-filter"></i>
                        <div class="flex gap-4 items-center">
                            {/* {{-- <img src="" alt="profile picture" class=""> --}} */}
                            <i class="fas fa-user text-2xl border-2 border-black p-2 rounded-full"></i>
                            <button class="transition ease-in-out delay-75 p-1 arrow relative hover:mt-2">
                                <i class="fas fa-arrow-down"></i>
                                <button
                                    id="logout"
                                    class="hidden absolute top-[5rem] -right-0 p-2  h-10 bg-white shadow-lg"
                                >
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
                                <tr class="bg-gray-100 ">
                                    <th class="py-3 px-4 text-left text-gray-600 font-bold rounded-tl-lg">
                                        Id
                                    </th>
                                    <th class="py-3 px-4 text-left text-gray-600 font-bold">
                                        FullName
                                    </th>
                                    <th class="py-3 px-4 text-left text-gray-600 font-bold">
                                        Department
                                    </th>
                                    <th class="py-3 px-4 text-left text-gray-600 font-bold">
                                        Programme
                                    </th>
                                    <th class="py-3 px-4 text-left text-gray-600 font-bold">
                                        Matriculation Number
                                    </th>
                                    <th class="py-3 px-4 text-left text-gray-600 font-bold rounded-tr-lg">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(10)].map((student, index) => (
                                    <tr class="border-b">
                                        <td class="py-3 px-4 text-gray-700">
                                            {index + 1}
                                        </td>
                                        <td class="py-3 px-4 text-gray-700">
                                            Idris Adam Idris
                                        </td>
                                        <td class="py-3 px-4 text-gray-700">
                                            Computer Science
                                        </td>
                                        <td class="py-3 px-4 text-gray-700">
                                            Computer Science
                                        </td>
                                        <td class="py-3 px-4 text-gray-700">
                                            UGC/COM/21/001{index+1}
                                        </td>
                                        <td class="py-3 px-4 text-gray-700">
                                            <button
                                                id="show_detail"
                                                class="p-2 "
                                            >
                                                {" "}
                                                <FaEye />
                                            </button>
                                            <button
                                                id="show_detail"
                                                class="p-2"
                                            >
                                                {" "}
                                                <FaPenToSquare />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="text-sm text-gray-600">
                                Showing 6-21 of 1000
                            </span>
                            <div class="flex space-x-1 text-gray-600">
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    1
                                </a>
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    2
                                </a>
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    3
                                </a>
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    4
                                </a>
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    5
                                </a>
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    6
                                </a>
                                <a
                                    href="#"
                                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    7
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
