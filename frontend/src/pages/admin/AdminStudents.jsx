import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaPlus, FaTimes, FaSearch, FaUpload, FaUsers, FaDownload, FaEdit } from "react-icons/fa";
import { path } from "../../../utils/path";
import LevelSelector from "../../components/LevelSelector";
import AdminSidebar from "../../components/AdminSidebar";
import * as XLSX from 'xlsx';

const AdminStudents = () => {
    const { id: userId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ full_name: "", candidate_no: "", department: "", programme: "", image: null });
    const [editingStudent, setEditingStudent] = useState(null);
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
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

    // ... (fetchStudents remains same)

    const handleEditStudent = (student) => {
        setEditingStudent({
            id: student.id,
            full_name: student.full_name,
            candidate_no: student.candidate_no,
            department: student.department,
            programme: student.programme,
            image: null // Start with no new image
        });
        setEditImagePreview(student.image ? `${path.replace('/api', '')}/${student.image}` : null);
        setShowEditModal(true);
        setErrMsg("");
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!editingStudent.full_name || !editingStudent.candidate_no) {
            setErrMsg("Full name and candidate number are required.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('full_name', editingStudent.full_name);
            formData.append('candidate_no', editingStudent.candidate_no);
            
            // Only append department/programme if super admin (level admin can't change level-bound fields usually, but assuming editable for now based on role check)
            if (currentUser?.role !== 'level_admin') {
                formData.append('department', editingStudent.department);
                formData.append('programme', editingStudent.programme);
            }

            if (editingStudent.image) {
                formData.append('image', editingStudent.image);
            }

            await axios.post(`${path}/update-student/${editingStudent.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setShowEditModal(false);
            fetchStudents();
            alert("Student updated successfully!");
        } catch (err) {
            console.error("Error updating student:", err);
            setErrMsg(err.response?.data?.error || "Failed to update student.");
        }
    };

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

            // Get the active exam first (handle 404 if no active exam)
            let currentExam = null;
            try {
                const examRes = await axios.get(`${path}/get-current-exam`);
                currentExam = examRes.data;
                console.log('Current exam from API:', currentExam);
                setActiveExam(currentExam);
            } catch (examErr) {
                // If 404, there's no active exam - this is okay
                if (examErr.response?.status === 404) {
                    console.log('No active exam found (404) - this is normal');
                    setActiveExam(null);
                } else {
                    // Other errors should be logged
                    console.error('Error fetching active exam:', examErr);
                }
            }

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

            // For level admins, always use level-based filtering regardless of active exam
            // This ensures they see all their students, not just those enrolled in the active course
            if (userRes.data.role === 'level_admin') {
                console.log('Level admin detected, using level-based student fetching');
                const res = await axios.get(`${path}/students-by-level`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log('Students fetched (level admin):', res.data);
                setStudents(res.data.map(student => ({
                    ...student,
                    exam_id: currentExam.id
                })));
                return;
            }

            // For super admins, get students for the active exam's course, filtered by level
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
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            setErrMsg(`Failed to load students: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadStudents = async () => {
            await fetchStudents();
        };
        loadStudents();
    }, []); // Remove selectedLevel dependency to avoid multiple calls

    useEffect(() => {
        // Only refetch when selectedLevel changes and it's not the initial load
        if (selectedLevel && currentUser) {
            const loadStudents = async () => {
                await fetchStudents();
            };
            loadStudents();
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
            // Use FormData to handle file upload
            const formData = new FormData();
            formData.append('full_name', newStudent.full_name);
            formData.append('candidate_no', newStudent.candidate_no);
            formData.append('password', 'password');
            formData.append('is_logged_on', 'no');

            // Add image if selected
            if (newStudent.image) {
                formData.append('image', newStudent.image);
            }

            // For level admins, automatically set department and programme from their academic session
            if (currentUser?.role === 'level_admin' && currentUser?.level_id) {
                formData.append('level_id', currentUser.level_id);
                formData.append('department', currentUser.level?.title || "Department");
                formData.append('programme', currentUser.level?.title || "Programme");
                console.log('Level admin student data');
            } else {
                // For super admins, use the form data
                formData.append('department', newStudent.department);
                formData.append('programme', newStudent.programme);
                if (selectedLevel) {
                    formData.append('level_id', selectedLevel);
                }
                console.log('Super admin student data');
            }

            await axios.post(`${path}/register-student/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Student added successfully, refreshing list...');
            setShowAddModal(false);
            setNewStudent({ full_name: "", candidate_no: "", department: "", programme: "", image: null });
            setImagePreview(null);

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
        if (!selectedStudent || !extensionMinutes || !activeExam) return;

        try {
            await axios.post(`${path}/extend-time`, {
                student_id: selectedStudent.id,
                exam_id: activeExam.id,
                extension_minutes: parseInt(extensionMinutes)
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setShowExtendTimeModal(false);
            setSelectedStudent(null);
            setExtensionMinutes("");
            fetchStudents(); // Refresh list to show new extension
            alert("Time extended successfully!");
        } catch (err) {
            console.error("Error extending time:", err);
            setErrMsg(err.response?.data?.error || "Failed to extend time");
        }
    };

    const handleViewTicket = async (student) => {
        setErrMsg("");

        try {
            const res = await axios.post(`${path}/invigilator/generate-ticket`, {
                student_id: student.id
            });

            const ticketNumber = res.data?.ticket_no;

            if (!ticketNumber) {
                throw new Error('Ticket not found for this student.');
            }

            alert(`Ticket for ${student.full_name}: ${ticketNumber}\n\nPlease ask the student to keep this ticket safe. Invigilators only verify tickets during check-in.`);
        } catch (error) {
            console.error('View ticket error:', error);
            setErrMsg(
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Unable to fetch ticket"
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

    const handleDownloadTemplate = () => {
        // Create template data with headers and sample row
        const templateData = [
            {
                'Full Name': 'John Doe',
                'Candidate Number': 'STU001',
                'Department': 'Computer Science',
                'Programme': 'BSc Computer Science',
                'Email': 'john.doe@example.com'
            }
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Full Name
            { wch: 18 }, // Candidate Number
            { wch: 25 }, // Department
            { wch: 30 }, // Programme
            { wch: 25 }  // Email
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Students');

        // Generate and download file
        XLSX.writeFile(wb, 'student_import_template.xlsx');
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
            <AdminSidebar userId={userId} />

            {/* Main Content */}
            <main className="flex-1 p-8 min-w-0 overflow-hidden">
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Photo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Full Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Candidate No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Programme</th>
                                    {currentUser?.role === 'super_admin' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Level</th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Time Extension</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ticket</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={currentUser?.role === 'super_admin' ? 9 : 8} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                                <p className="text-gray-600 text-lg">Loading students...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={currentUser?.role === 'super_admin' ? 9 : 8} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <FaUsers className="text-6xl mb-4 text-gray-300" />
                                                <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
                                                <p className="text-gray-400 mb-4">
                                                    {searchTerm
                                                        ? `No students match "${searchTerm}"`
                                                        : currentUser?.role === 'level_admin'
                                                            ? `No students in your department yet`
                                                            : selectedLevel
                                                                ? `No students in the selected department`
                                                                : `No students registered yet`
                                                    }
                                                </p>
                                                <button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                >
                                                    <FaPlus className="mr-2" /> Register First Student
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedStudents.map(student => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.image ? (
                                                <img
                                                    src={`${path.replace('/api', '')}/${student.image}`}
                                                    alt={student.full_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <FaUsers className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
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
                                            {student.ticket_no ? (
                                                <span className="px-3 py-1 text-sm font-mono bg-green-100 text-green-800 rounded-full border border-green-300">
                                                    {student.ticket_no}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full italic">
                                                    Not assigned yet
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditStudent(student)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                                    title="Edit Student"
                                                >
                                                    <FaEdit />
                                                </button>
                                                {activeExam && student.ticket_no && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowExtendTimeModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
                                                    >
                                                        Extend Time
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Error Message */}
                    {errMsg && !loading && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-center">{errMsg}</p>
                        </div>
                    )}
                    {/* Pagination Controls */}
                    {!loading && filteredStudents.length > studentsPerPage && (
                        <div className="flex justify-between items-center mt-6 px-6">
                            <p className="text-sm text-gray-600">
                                Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === i + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student Photo (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setNewStudent({ ...newStudent, image: file });
                                            // Create preview
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImagePreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: JPEG, PNG, JPG, GIF, WEBP (max 2MB)
                                </p>
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>

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

            {/* Edit Student Modal */}
            {showEditModal && editingStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Edit Student</h3>
                            <button onClick={() => setShowEditModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateStudent} className="space-y-4">
                            {errMsg && <p className="text-red-500">{errMsg}</p>}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    value={editingStudent.full_name}
                                    onChange={e => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Candidate Number</label>
                                <input
                                    type="text"
                                    value={editingStudent.candidate_no}
                                    onChange={e => setEditingStudent({ ...editingStudent, candidate_no: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student Photo
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setEditingStudent({ ...editingStudent, image: file });
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setEditImagePreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                {editImagePreview && (
                                    <div className="mt-2">
                                        <img src={editImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>

                            {currentUser?.role !== 'level_admin' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <input
                                            type="text"
                                            value={editingStudent.department}
                                            onChange={e => setEditingStudent({ ...editingStudent, department: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Programme</label>
                                        <input
                                            type="text"
                                            value={editingStudent.programme}
                                            onChange={e => setEditingStudent({ ...editingStudent, programme: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Update Student</button>
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

                            {/* Download Template Button */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 mb-3">
                                    <strong>First time importing?</strong> Download the template to see the required format.
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

                            {/* File Upload */}
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
