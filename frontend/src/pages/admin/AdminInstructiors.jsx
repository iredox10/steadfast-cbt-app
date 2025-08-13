import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaUsers, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaSearch } from "react-icons/fa";
import { path } from "../../../utils/path";

const AdminInstructors = () => {
    const { userId } = useParams();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newInstructor, setNewInstructor] = useState({ full_name: "", email: "", role: "", password: "" });
    const [errMsg, setErrMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const instructorsPerPage = 10;

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${path}/get-users`);
            setInstructors(res.data);
        } catch (err) {
            console.error("Error fetching instructors:", err);
            setErrMsg("Failed to load instructors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const handleAddInstructor = async (e) => {
        e.preventDefault();
        if (!newInstructor.full_name || !newInstructor.email || !newInstructor.role || !newInstructor.password) {
            setErrMsg("All fields are required.");
            return;
        }
        setErrMsg("");
        try {
            await axios.post(`${path}/add-user`, { ...newInstructor, status: "active" });
            setShowAddModal(false);
            setNewInstructor({ full_name: "", email: "", role: "", password: "" });
            fetchInstructors();
        } catch (err) {
            console.error("Error adding instructor:", err);
            setErrMsg(err.response?.data || "Failed to add instructor.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInstructor(prev => ({ ...prev, [name]: value }));
    };

    const filteredInstructors = useMemo(() =>
        instructors.filter(instructor =>
            instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [instructors, searchTerm]);

    const paginatedInstructors = useMemo(() => {
        const startIndex = (currentPage - 1) * instructorsPerPage;
        return filteredInstructors.slice(startIndex, startIndex + instructorsPerPage);
    }, [filteredInstructors, currentPage]);

    const totalPages = Math.ceil(filteredInstructors.length / instructorsPerPage);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                 <div className="flex items-center mb-10">
                    <img src="/assets/logo.webp" alt="School Logo" className="h-10 w-10 mr-3" />
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <Link to={`/admin-dashboard/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaListAlt className="mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin-sessions" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to="/admin-instructors" className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaChalkboardTeacher className="mr-3" /> Instructors
                    </Link>
                    <Link to="/exam-archives" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exam Archives
                    </Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 w-52">
                     <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaCog className="mr-3" /> Settings
                    </Link>
                    <Link to="/admin-login" className="flex items-center p-3 mt-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FaSignOutAlt className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Manage Instructors</h2>
                        <p className="text-gray-500">Add, view, and manage instructor records.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Add Instructor
                    </button>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative mb-4">
                        <FaSearch className="absolute top-3 left-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                        />
                    </div>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedInstructors.map(instructor => (
                                <tr key={instructor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{instructor.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{instructor.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{instructor.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/admin-instructor-courses/${instructor.id}`} className="text-blue-500 hover:underline">View Courses</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
                                Previous
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Instructor Modal */}
            {showAddModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Add New Instructor</h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddInstructor} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}
                            <input type="text" name="full_name" placeholder="Full Name" value={newInstructor.full_name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                            <input type="email" name="email" placeholder="Email Address" value={newInstructor.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                            <select name="role" value={newInstructor.role} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
                                <option value="" disabled>Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="regular">Regular</option>
                                <option value="lecturer">Lecturer</option>
                            </select>
                            <input type="password" name="password" placeholder="Password" value={newInstructor.password} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Add Instructor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInstructors;