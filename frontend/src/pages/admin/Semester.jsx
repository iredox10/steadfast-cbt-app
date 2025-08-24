import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaUsers, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaChevronRight } from "react-icons/fa";
import { path } from "../../../utils/path";

const Semester = () => {
    const { id: semesterId, userId } = useParams();
    const [semester, setSemester] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: "", code: "", credit_unit: "" });
    const [errMsg, setErrMsg] = useState("");

    const fetchSemesterAndCourses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${path}/get-semester/${semesterId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSemester(res.data.semester);
            setCourses(res.data.courses);
        } catch (err) {
            console.error("Error fetching data:", err);
            setErrMsg("Failed to load semester data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesterAndCourses();
    }, [semesterId]);

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.title || !newCourse.code || !newCourse.credit_unit) {
            setErrMsg("All fields are required.");
            return;
        }
        setErrMsg("");
        try {
            await axios.post(`${path}/add-course/${semesterId}`, newCourse, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowAddModal(false);
            setNewCourse({ title: "", code: "", credit_unit: "" });
            fetchSemesterAndCourses();
        } catch (err) {
            console.error("Error adding course:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data || "Failed to add course.";
            setErrMsg(typeof errorMessage === 'string' ? errorMessage : "Failed to add course.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

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
                    <Link to="/admin-sessions" className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaCalendarAlt className="mr-3" /> Sessions
                    </Link>
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to={`/admin-instructors/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaChalkboardTeacher className="mr-3" /> Instructors
                    </Link>
                    <Link to="/exam-archives" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exam Archives
                    </Link>
                    <Link to={`/admin-exam/${userId}`} className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBook className="mr-3" /> Exams
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
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Link to="/admin-sessions" className="hover:underline">Academic Sessions</Link>
                            <FaChevronRight className="mx-2" />
                            <Link to={`/session/${semester?.acd_session_id}`} className="hover:underline">{semester?.acd_session?.title || "Session"}</Link>
                            <FaChevronRight className="mx-2" />
                            <span className="font-medium text-gray-800 capitalize">{semester?.semester || "Semester"}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Manage Courses</h2>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Add New Course
                    </button>
                </header>

                {loading ? (
                    <p>Loading courses...</p>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Units</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{course.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{course.credit_unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Add Course Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Add New Course</h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddCourse}>
                            {errMsg && <p className="text-red-500 mb-4">{errMsg}</p>}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                                    <input id="title" name="title" type="text" value={newCourse.title} onChange={handleInputChange} placeholder="e.g., Introduction to Physics" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                    <input id="code" name="code" type="text" value={newCourse.code} onChange={handleInputChange} placeholder="e.g., PHY101, MTH201, CSC301" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <p className="text-xs text-gray-500 mt-1">Course codes must be unique across the entire system</p>
                                </div>
                                <div>
                                    <label htmlFor="credit_unit" className="block text-sm font-medium text-gray-700 mb-1">Credit Units</label>
                                    <input id="credit_unit" name="credit_unit" type="number" value={newCourse.credit_unit} onChange={handleInputChange} placeholder="e.g., 3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Add Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Semester;
