import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaBook, FaChevronRight, FaUserPlus, FaUpload, FaDownload } from "react-icons/fa";
import { path } from "../../../utils/path";
import AdminSidebar from "../../components/AdminSidebar";
import * as XLSX from 'xlsx';

const Semester = () => {
    const { id: semesterId, userId } = useParams();
    const navigate = useNavigate();
    const [semester, setSemester] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: "", code: "", credit_unit: "" });
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
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

    const handleImportCourses = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrMsg("Please select a file to upload.");
            return;
        }
        setIsUploading(true);
        setErrMsg("");

        const formData = new FormData();
        formData.append("file", file);
        
        // Pass both session_id and semester_id to the backend
        // This allows the backend to optionally use the semester_id if provided
        // to automatically assign the course to this semester if the column is missing
        if (semester?.acd_session_id) {
            formData.append("session_id", semester.acd_session_id);
        }
        
        // Pass the specific semester ID we are currently viewing
        if (semesterId) {
            formData.append("semester_id", semesterId);
        }

        try {
            await axios.post(`${path}/import-courses`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setShowImportModal(false);
            setFile(null);
            fetchSemesterAndCourses();
            alert("Courses imported successfully!");
        } catch (error) {
            console.error("Error uploading file:", error);
            setErrMsg(error.response?.data?.error || "Error uploading file. Please check the format.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        // Generate template based on backend expectation
        // Backend expects: Code, Title, Credit Unit, Semester
        // We can pre-fill "Semester" column with the current semester name to help the user
        const currentSemesterName = semester?.semester || "First Semester";
        
        const templateData = [
            {
                'Code': 'CSC101',
                'Title': 'Introduction to Computer Science',
                'Credit Unit': '3',
                'Semester': currentSemesterName
            },
            {
                'Code': 'MTH101',
                'Title': 'General Mathematics I',
                'Credit Unit': '3',
                'Semester': currentSemesterName
            }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 10 }, // Code
            { wch: 30 }, // Title
            { wch: 12 }, // Credit Unit
            { wch: 20 }  // Semester
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Courses');
        XLSX.writeFile(wb, 'courses_import_template.xlsx');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <AdminSidebar userId={userId} />

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
                    <div className="flex gap-3">
                        <button onClick={() => setShowImportModal(true)} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                            <FaUpload className="mr-2" /> Import Courses
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <FaPlus className="mr-2" /> Add New Course
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading courses...</p>
                        </div>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Units</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{course.code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{course.credit_unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/student-enrollment/${course.id}`)}
                                                className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <FaUserPlus className="mr-2" />
                                                Enroll Students
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-center">
                            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                                <FaBook className="w-full h-full" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Courses Available
                            </h3>
                            <p className="text-gray-600 mb-6">
                                This semester doesn't have any courses yet. Click the button below to add your first course.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <FaUpload className="mr-2" />
                                    Import Courses
                                </button>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <FaPlus className="mr-2" />
                                    Add First Course
                                </button>
                            </div>
                        </div>
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

            {/* Import Courses Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Import Courses</h3>
                            <button onClick={() => setShowImportModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleImportCourses} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 mb-3">
                                    <strong>Download Template:</strong> Use this template to ensure your file is formatted correctly.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full justify-center"
                                >
                                    <FaDownload className="mr-2" />
                                    Download Excel Template
                                </button>
                            </div>

                            <div className="p-4 border-2 border-dashed rounded-lg text-center">
                                <input type="file" onChange={e => setFile(e.target.files[0])} accept=".xlsx, .xls, .csv" className="hidden" id="course-file-upload" />
                                <label htmlFor="course-file-upload" className="cursor-pointer text-blue-500">
                                    {file ? file.name : "Choose an Excel file"}
                                </label>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-green-300">
                                    {isUploading ? "Uploading..." : "Import"}
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
