import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaUsers, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaChevronRight } from "react-icons/fa";
import { path } from "../../../utils/path";

const InstructorsCourses = () => {
    const { id: instructorId, userId } = useParams();
    const [instructor, setInstructor] = useState(null);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [errMsg, setErrMsg] = useState("");

    const fetchInstructorData = async () => {
        setLoading(true);
        try {
            const instructorRes = await axios.get(`${path}/get-user/${instructorId}`);
            setInstructor(instructorRes.data);

            const assignedCoursesRes = await axios.get(`${path}/get-lecturer-courses/${instructorId}`);
            setAssignedCourses(assignedCoursesRes.data);

            const allCoursesRes = await axios.get(`${path}/get-active-session`);
            setAllCourses(allCoursesRes.data);

        } catch (err) {
            console.error("Error fetching data:", err);
            setErrMsg("Failed to load instructor data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructorData();
    }, [instructorId]);

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) {
            setErrMsg("Please select a course to assign.");
            return;
        }
        setErrMsg("");
        try {
            await axios.post(`${path}/add-lecturer-course/${instructorId}/${selectedCourseId}`);
            setShowAssignModal(false);
            setSelectedCourseId("");
            fetchInstructorData(); // Refetch to show the new assignment
        } catch (err) {
            console.error("Error assigning course:", err);
            setErrMsg(err.response?.data || "Failed to assign course.");
        }
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
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Link to="/admin-instructors" className="hover:underline">Instructors</Link>
                            <FaChevronRight className="mx-2" />
                            <span className="font-medium text-gray-800">{instructor?.full_name || "Instructor"}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Manage Course Assignments</h2>
                    </div>
                    <button onClick={() => setShowAssignModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Assign New Course
                    </button>
                </header>

                {loading ? (
                    <p>Loading courses...</p>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Courses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignedCourses.map(course => (
                                <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold text-gray-800">{course.title}</h4>
                                    <p className="text-sm text-gray-600">{course.code}</p>
                                </div>
                            ))}
                            {assignedCourses.length === 0 && <p className="text-gray-500">No courses assigned yet.</p>}
                        </div>
                    </div>
                )}
            </main>

            {/* Assign Course Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Assign Course</h3>
                            <button onClick={() => setShowAssignModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAssignCourse}>
                            {errMsg && <p className="text-red-500 mb-4">{errMsg}</p>}
                            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">Select a course from the active session</label>
                            <select
                                id="course"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="" disabled>Choose a course...</option>
                                {allCourses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title} ({course.code})</option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Assign Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorsCourses;