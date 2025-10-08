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
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [errMsg, setErrMsg] = useState("");

    const fetchInstructorData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Get current user first
            const userRes = await axios.get(`${path}/user`, { headers });
            setCurrentUser(userRes.data);

            // Get instructor details
            const instructorRes = await axios.get(`${path}/get-user/${instructorId}`, { headers });
            setInstructor(instructorRes.data);

            // Get assigned courses for this instructor
            console.log('Fetching assigned courses for instructor ID:', instructorId);
            const assignedCoursesRes = await axios.get(`${path}/get-lecturer-courses/${instructorId}`, { headers });
            console.log('Assigned courses response:', assignedCoursesRes.data);
            console.log('Is response an array?', Array.isArray(assignedCoursesRes.data));
            setAssignedCourses(Array.isArray(assignedCoursesRes.data) ? assignedCoursesRes.data : []);

            // Get available courses for assignment (filtered by user role in backend)
            const allCoursesRes = await axios.get(`${path}/get-courses`, { headers });
            setAllCourses(Array.isArray(allCoursesRes.data) ? allCoursesRes.data : []);

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
            const token = localStorage.getItem('token');
            await axios.post(`${path}/add-lecturer-course/${instructorId}/${selectedCourseId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAssignModal(false);
            setSelectedCourseId("");
            fetchInstructorData(); // Refetch to show the new assignment
        } catch (err) {
            console.error("Error assigning course:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.response?.data || "Failed to assign course.";
            setErrMsg(typeof errorMessage === 'string' ? errorMessage : "Failed to assign course.");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 flex-shrink-0 border-r border-gray-200">
                 <div className="flex items-center mb-10">
                    <img src="/assets/buk.png" alt="School Logo" className="h-10 w-10 mr-3" />
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
                    <Link to={`/admin-instructors/${userId}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
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
                            <Link to={`/admin-instructors/${userId}`} className="hover:underline">Instructors</Link>
                            <FaChevronRight className="mx-2" />
                            <span className="font-medium text-gray-800">{instructor?.full_name || "Instructor"}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {currentUser?.role === 'level_admin' ? 'Assign Your Courses' : 'Manage Course Assignments'}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {currentUser?.role === 'level_admin' 
                                ? `Assign courses you created to ${instructor?.full_name || 'this instructor'}`
                                : `Manage course assignments for ${instructor?.full_name || 'this instructor'}`
                            }
                        </p>
                    </div>
                    <button onClick={() => setShowAssignModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Assign New Course
                    </button>
                </header>

                {loading ? (
                    <p>Loading courses...</p>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {currentUser?.role === 'level_admin' ? 'Your Courses Assigned' : 'Assigned Courses'}
                            </h3>
                            <span className="text-sm text-gray-500">
                                {Array.isArray(assignedCourses) ? assignedCourses.length : 0} course(s) assigned
                            </span>
                        </div>
                        {currentUser?.role === 'level_admin' && (
                            <p className="text-sm text-blue-600 mb-4">
                                Only courses you created are available for assignment
                            </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.isArray(assignedCourses) && assignedCourses.map(course => (
                                <div key={course.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <h4 className="font-bold text-gray-800">{course.title}</h4>
                                    <p className="text-sm text-gray-600">{course.code}</p>
                                    <p className="text-xs text-gray-500 mt-2">{course.credit_unit} credit units</p>
                                    {currentUser?.role === 'level_admin' && (
                                        <p className="text-xs text-blue-600 mt-1">Your course</p>
                                    )}
                                </div>
                            ))}
                            {(!Array.isArray(assignedCourses) || assignedCourses.length === 0) && (
                                <div className="col-span-full text-center py-8">
                                    <FaBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">No courses assigned yet.</p>
                                    {currentUser?.role === 'level_admin' && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            Create courses in your semesters first, then assign them to this lecturer
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Assign Course Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">
                                {currentUser?.role === 'level_admin' ? 'Assign Your Course' : 'Assign Course'}
                            </h3>
                            <button onClick={() => setShowAssignModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAssignCourse}>
                            {errMsg && <p className="text-red-500 mb-4">{errMsg}</p>}
                            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                                {currentUser?.role === 'level_admin' 
                                    ? 'Select a course from your created courses'
                                    : 'Select a course from the active session'
                                }
                            </label>
                            <select
                                id="course"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>Choose a course...</option>
                                {Array.isArray(allCourses) && allCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title} ({course.code}) - {course.credit_unit} units
                                    </option>
                                ))}
                            </select>
                            {currentUser?.role === 'level_admin' && (
                                <p className="text-sm text-blue-600 mt-2">
                                    Only courses you created are shown in this list
                                </p>
                            )}
                            {Array.isArray(allCourses) && allCourses.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-2">
                                    {currentUser?.role === 'level_admin' 
                                        ? 'No courses available. Create courses in your semesters first.'
                                        : 'No courses available in the system.'
                                    }
                                </p>
                            )}
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