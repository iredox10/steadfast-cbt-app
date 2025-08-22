import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaTimes, FaUsers, FaBook, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaListAlt, FaSearch, FaUpload, FaUserShield } from "react-icons/fa";
import { path } from "../../../utils/path";
import LevelSelector from "../../components/LevelSelector";

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
    const [showExtendTimeModal, setShowExtendTimeModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [extensionMinutes, setExtensionMinutes] = useState("");
    const [activeExam, setActiveExam] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("");
    const studentsPerPage = 10;

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Get current user first
            const userRes = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentUser(userRes.data);
            console.log('Current user data:', userRes.data);

            // Set initial level for level admin
            let currentLevel = selectedLevel;
            if (userRes.data.role === 'level_admin' && userRes.data.level_id) {
                if (!selectedLevel) {
                    currentLevel = userRes.data.level_id;
                    setSelectedLevel(userRes.data.level_id);
                }
            }

            // Get the active exam first
            const examRes = await axios.get(`${path}/get-current-exam`);
            const currentExam = examRes.data;
            console.log('Current exam from API:', currentExam);
            setActiveExam(currentExam);

            if (!currentExam || !currentExam.course_id) {
                console.log('No active exam or course_id found');
                
                // If no active exam, get students based on user level
                // Use the same endpoint as dashboard for consistency
                let studentsUrl = `${path}/students-by-level`;
                
                // For super admins, add level filter if a specific level is selected
                if (userRes.data.role === 'super_admin' && currentLevel) {
                    studentsUrl += `?level_id=${currentLevel}`;
                }
                
                console.log('Fetching students from URL:', studentsUrl);
                const res = await axios.get(studentsUrl, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log('Students fetched (no active exam):', res.data);
                setStudents(res.data);
                return;
            }

            console.log('Fetching students for course:', currentExam.course_id);
            // Get students for the active exam's course, filtered by level
            let studentsUrl = `${path}/invigilator/students/${currentExam.course_id}`;
            
            // For super admins, add level filter if a specific level is selected
            if (userRes.data.role === 'super_admin' && currentLevel) {
                studentsUrl += `?level_id=${currentLevel}`;
            }
            
            console.log('Fetching course students from URL:', studentsUrl);
            
            const res = await axios.get(studentsUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Students fetched (with active exam):', res.data);
            setStudents(res.data.map(student => ({
                ...student,
                exam_id: currentExam.id
            })));
        } catch (err) {
            console.error("Error fetching students:", err);
            setErrMsg("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []); // Remove selectedLevel dependency to avoid multiple calls

    useEffect(() => {
        // Only refetch when selectedLevel changes and it's not the initial load
        if (selectedLevel && currentUser) {
            fetchStudents();
        }
    }, [selectedLevel]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        
        // Basic validation for required fields
        if (!newStudent.full_name || !newStudent.candidate_no) {
            setErrMsg("Full name and candidate number are required.");
            return;
        }

        // Additional validation for super admin
        if (currentUser?.role === 'super_admin') {
            if (!newStudent.department || !newStudent.programme || !selectedLevel) {
                setErrMsg("All fields including department, programme, and academic session are required.");
                return;
            }
        }

        setErrMsg("");
        try {
            const studentData = { 
                full_name: newStudent.full_name,
                candidate_no: newStudent.candidate_no, // Keep as candidate_no to match backend
                password: "password", 
                is_logged_on: "no"
            };

            // For level admins, automatically set department and programme from their academic session
            if (currentUser?.role === 'level_admin' && currentUser?.level_id) {
                studentData.level_id = currentUser.level_id;
                studentData.department = currentUser.level?.title || "Department";
                studentData.programme = currentUser.level?.title || "Programme";
                console.log('Level admin student data:', studentData);
            } else {
                // For super admins, use the form data
                studentData.department = newStudent.department;
                studentData.programme = newStudent.programme;
                if (selectedLevel) {
                    studentData.level_id = selectedLevel;
                }
                console.log('Super admin student data:', studentData);
            }

            await axios.post(`${path}/register-student/${userId}`, studentData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            console.log('Student added successfully, refreshing list...');
            setShowAddModal(false);
            setNewStudent({ full_name: "", candidate_no: "", department: "", programme: "" });
            
            // Wait a bit for the database to update, then refresh
            setTimeout(() => {
                fetchStudents();
            }, 500);
            
        } catch (err) {
            console.error("Error adding student:", err);
            console.error("Error response:", err.response?.data);
            setErrMsg(err.response?.data?.error || "Failed to add student.");
        }
    };

    const handleExtendTime = async (e) => {
        e.preventDefault();
        setErrMsg("");

        console.log('Active exam:', activeExam);
        console.log('Selected student:', selectedStudent);

        if (!extensionMinutes || parseInt(extensionMinutes) < 1) {
            setErrMsg("Please enter a valid number of minutes");
            return;
        }

            // Get the active exam first
            const examRes = await axios.get(`${path}/get-current-exam`);
            const currentExam = examRes.data;
            setActiveExam(currentExam);

            // Always use /students-by-level for consistency with dashboard
            let studentsUrl = `${path}/students-by-level`;
            // For super admins, add level filter if a specific level is selected
            if (userRes.data.role === 'super_admin' && currentLevel) {
                studentsUrl += `?level_id=${currentLevel}`;
            }
            const res = await axios.get(studentsUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStudents(res.data);

        // Confirm action
        const confirmMessage = `Are you sure you want to regenerate a new ticket for ${student.full_name}?\n\nThis will:\n• Generate a new ticket number\n• Reset their login status\n• Allow them to log in again with the new ticket`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const res = await axios.post(`${path}/invigilator/regenerate-ticket`, {
                student_id: student.id
            });

            console.log('Regenerate ticket response:', res.data);
            
            // Show success message with new ticket
            alert(`New ticket generated successfully!\n\nStudent: ${student.full_name}\nNew Ticket: ${res.data.new_ticket}\n\nPlease provide this new ticket to the student so they can log in and continue their exam.`);
            
            // Refresh the student list to show updated ticket
            await fetchStudents();
        } catch (error) {
            console.error('Regenerate ticket error:', error);
            setErrMsg(
                error.response?.data?.error || 
                error.response?.data?.message || 
                "Failed to regenerate ticket"
            );
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
                    {(currentUser?.role === 'super_admin' || currentUser?.role === 'level_admin') && (
                        <Link to="/admin-management" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaUserShield className="mr-3" /> Admin Management
                        </Link>
                    )}
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
                        <h2 className="text-3xl font-bold text-gray-900">Manage Students</h2>
                        <p className="text-gray-500">Add, view, and manage student records.</p>
                        {activeExam ? (
                            <p className="text-green-600 text-sm">Active Exam: {activeExam.title || `Exam ID: ${activeExam.id}`}</p>
                        ) : (
                            <p className="text-yellow-600 text-sm">No active exam found</p>
                        )}
                        {currentUser?.role !== 'super_admin' && currentUser?.level?.title && (
                            <p className="text-blue-600 text-sm">Level: {currentUser.level.title}</p>
                        )}
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

                {/* Level Selector for Super Admin */}
                {currentUser?.role === 'super_admin' && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                        <LevelSelector
                            currentUser={currentUser}
                            selectedLevel={selectedLevel}
                            onLevelChange={setSelectedLevel}
                            showAllOption={true}
                        />
                    </div>
                )}

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
                                {currentUser?.role === 'super_admin' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Extension</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.candidate_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.programme}</td>
                                    {currentUser?.role === 'super_admin' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                {student.level?.title || 'Not assigned'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {student.time_extension ? `+${student.time_extension} minutes` : 'None'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">
                                            {student.ticket_no || 'Not generated'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {activeExam && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowExtendTimeModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
                                                >
                                                    Extend Time
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateTicket(student)}
                                                    className="px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 text-sm"
                                                    title="Generate new ticket for student"
                                                >
                                                    New Ticket
                                                </button>
                                            </div>
                                        )}
                                    </td>
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
                            
                            {/* Show department info for level admins */}
                            {currentUser?.role === 'level_admin' && currentUser?.level && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2">Student will be registered to:</h4>
                                    <p className="text-blue-700"><strong>Department:</strong> {currentUser.level.title}</p>
                                    <p className="text-blue-700"><strong>Programme:</strong> {currentUser.level.title}</p>
                                </div>
                            )}
                            
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={newStudent.full_name} 
                                onChange={e => setNewStudent({ ...newStudent, full_name: e.target.value })} 
                                className="w-full px-4 py-2 border rounded-lg" 
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="Candidate Number" 
                                value={newStudent.candidate_no} 
                                onChange={e => setNewStudent({ ...newStudent, candidate_no: e.target.value })} 
                                className="w-full px-4 py-2 border rounded-lg" 
                                required
                            />
                            
                            {/* Only show department and programme fields for super admins */}
                            {currentUser?.role !== 'level_admin' && (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="Department" 
                                        value={newStudent.department} 
                                        onChange={e => setNewStudent({ ...newStudent, department: e.target.value })} 
                                        className="w-full px-4 py-2 border rounded-lg" 
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Programme" 
                                        value={newStudent.programme} 
                                        onChange={e => setNewStudent({ ...newStudent, programme: e.target.value })} 
                                        className="w-full px-4 py-2 border rounded-lg" 
                                        required
                                    />
                                </>
                            )}
                            
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Extend Time Modal */}
            {showExtendTimeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Extend Time</h3>
                            <button onClick={() => {
                                setShowExtendTimeModal(false);
                                setSelectedStudent(null);
                                setExtensionMinutes("");
                                setErrMsg("");
                            }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleExtendTime} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student: {selectedStudent?.full_name}
                                </label>
                                {selectedStudent?.time_extension > 0 && (
                                    <p className="text-sm text-gray-500 mb-4">
                                        Current extension: {selectedStudent.time_extension} minutes
                                    </p>
                                )}
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Extension minutes"
                                    value={extensionMinutes}
                                    onChange={(e) => setExtensionMinutes(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowExtendTimeModal(false);
                                        setSelectedStudent(null);
                                        setExtensionMinutes("");
                                        setErrMsg("");
                                    }}
                                    className="px-4 py-2 bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                                >
                                    Extend Time
                                </button>
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
