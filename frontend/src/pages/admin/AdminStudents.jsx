import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaUsers, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaSearch, FaUpload } from "react-icons/fa";
import { path } from "../../../utils/path";

const AdminStudents = () => {
    const { id: userId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ full_name: "", candidate_no: "", department: "", programme: "" });
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${path}/get-students`);
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students:", err);
            setErrMsg("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!newStudent.full_name || !newStudent.candidate_no || !newStudent.department || !newStudent.programme) {
            setErrMsg("All fields are required.");
            return;
        }
        setErrMsg("");
        try {
            await axios.post(`${path}/register-student/${userId}`, { ...newStudent, password: "password", is_logged_on: "no" });
            setShowAddModal(false);
            setNewStudent({ full_name: "", candidate_no: "", department: "", programme: "" });
            fetchStudents();
        } catch (err) {
            console.error("Error adding student:", err);
            setErrMsg(err.response?.data?.error || "Failed to add student.");
        }
    };

    const handleImportStudents = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrMsg("Please select a file to upload.");
            return;
        }
        setIsUploading(true);
        setErrMsg("");
        const formData = new FormData();
        formData.append("excel_file", file);
        try {
            await axios.post(`${path}/upload-excel`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            setShowImportModal(false);
            setFile(null);
            fetchStudents();
        } catch (error) {
            console.error("Error uploading file:", error);
            setErrMsg(error.response?.data?.error || "Error uploading file.");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredStudents = useMemo(() =>
        students.filter(student =>
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.candidate_no.toLowerCase().includes(searchTerm.toLowerCase())
        ), [students, searchTerm]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * studentsPerPage;
        return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
    }, [filteredStudents, currentPage]);

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

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
                    <Link to={`/admin-students/${userId}`} className="flex items-center p-3 bg-blue-500 text-white rounded-lg">
                        <FaUsers className="mr-3" /> Students
                    </Link>
                    <Link to="/admin-instructors" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                        <h2 className="text-3xl font-bold text-gray-900">Manage Students</h2>
                        <p className="text-gray-500">Add, view, and manage student records.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <FaPlus className="mr-2" /> Register Student
                        </button>
                        <button onClick={() => setShowImportModal(true)} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                            <FaUpload className="mr-2" /> Import Students
                        </button>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative mb-4">
                        <FaSearch className="absolute top-3 left-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or candidate no..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                        />
                    </div>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.candidate_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.programme}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination Controls */}
                </div>
            </main>

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Register New Student</h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}
                            <input type="text" placeholder="Full Name" value={newStudent.full_name} onChange={e => setNewStudent({ ...newStudent, full_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            <input type="text" placeholder="Candidate Number" value={newStudent.candidate_no} onChange={e => setNewStudent({ ...newStudent, candidate_no: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            <input type="text" placeholder="Department" value={newStudent.department} onChange={e => setNewStudent({ ...newStudent, department: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            <input type="text" placeholder="Programme" value={newStudent.programme} onChange={e => setNewStudent({ ...newStudent, programme: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Students Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Import Students</h3>
                            <button onClick={() => setShowImportModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleImportStudents} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}
                            <div className="p-4 border-2 border-dashed rounded-lg text-center">
                                <input type="file" onChange={e => setFile(e.target.files[0])} accept=".xlsx, .xls" className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="cursor-pointer text-blue-500">
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

export default AdminStudents;
