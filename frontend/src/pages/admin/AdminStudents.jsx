import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaPlus, FaTimes, FaSearch, FaUpload, FaUsers, FaDownload, FaEdit, FaUserGraduate, FaIdCard, FaBuilding, FaBookOpen, FaClock, FaTicketAlt } from "react-icons/fa";
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

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const userRes = await axios.get(`${path}/user`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentUser(userRes.data);

            let currentLevel = selectedLevel;
            if (userRes.data.role === 'level_admin' && userRes.data.level_id) {
                if (!selectedLevel) {
                    currentLevel = userRes.data.level_id;
                    setSelectedLevel(userRes.data.level_id);
                }
            }

            let currentExam = null;
            try {
                const examRes = await axios.get(`${path}/get-current-exam`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                currentExam = examRes.data;
                setActiveExam(currentExam);
            } catch (examErr) {
                if (examErr.response?.status === 404) {
                    setActiveExam(null);
                }
            }

            if (!currentExam || !currentExam.course_id) {
                let studentsUrl = `${path}/students-by-level`;
                if (userRes.data.role === 'super_admin' && currentLevel) {
                    studentsUrl += `?level_id=${currentLevel}`;
                }
                const res = await axios.get(studentsUrl, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStudents(res.data);
                return;
            }

            if (userRes.data.role === 'level_admin') {
                const res = await axios.get(`${path}/students-by-level`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStudents(res.data.map(student => ({
                    ...student,
                    exam_id: currentExam.id
                })));
                return;
            }

            let studentsUrl = `${path}/invigilator/students/${currentExam.course_id}`;
            if (userRes.data.role === 'super_admin' && currentLevel) {
                studentsUrl += `?level_id=${currentLevel}`;
            }

            const res = await axios.get(studentsUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStudents(res.data.map(student => ({
                ...student,
                exam_id: currentExam.id,
                time_extension: student.time_extension || 0
            })));
        } catch (err) {
            console.error("Error fetching students:", err);
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
    }, []);

    useEffect(() => {
        if (selectedLevel && currentUser) {
            const loadStudents = async () => {
                await fetchStudents();
            };
            loadStudents();
        }
    }, [selectedLevel]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!newStudent.full_name || !newStudent.candidate_no) {
            setErrMsg("Full name and candidate number are required.");
            return;
        }

        if (currentUser?.role === 'super_admin') {
            if (!newStudent.department || !newStudent.programme || !selectedLevel) {
                setErrMsg("All fields including department, programme, and academic session are required.");
                return;
            }
        }

        setErrMsg("");
        try {
            const formData = new FormData();
            formData.append('full_name', newStudent.full_name);
            formData.append('candidate_no', newStudent.candidate_no);
            formData.append('password', 'password');
            formData.append('is_logged_on', 'no');

            if (newStudent.image) {
                formData.append('image', newStudent.image);
            }

            if (currentUser?.role === 'level_admin' && currentUser?.level_id) {
                formData.append('level_id', currentUser.level_id);
                formData.append('department', currentUser.level?.title || "Department");
                formData.append('programme', currentUser.level?.title || "Programme");
            } else {
                formData.append('department', newStudent.department);
                formData.append('programme', newStudent.programme);
                if (selectedLevel) {
                    formData.append('level_id', selectedLevel);
                }
            }

            await axios.post(`${path}/register-student/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setShowAddModal(false);
            setNewStudent({ full_name: "", candidate_no: "", department: "", programme: "", image: null });
            setImagePreview(null);
            setTimeout(() => {
                fetchStudents();
            }, 500);

        } catch (err) {
            setErrMsg(err.response?.data?.error || "Failed to add student.");
        }
    };

    const handleEditStudent = (student) => {
        setEditingStudent({
            id: student.id,
            full_name: student.full_name,
            candidate_no: student.candidate_no,
            department: student.department,
            programme: student.programme,
            image: null
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
        } catch (err) {
            setErrMsg(err.response?.data?.error || "Failed to update student.");
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
            fetchStudents();
            alert("Time extended successfully!");
        } catch (err) {
            setErrMsg(err.response?.data?.error || "Failed to extend time");
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
            setErrMsg(error.response?.data?.error || "Error uploading file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'Full Name': 'John Doe',
                'Candidate Number': 'STU001',
                'Department': 'Computer Science',
                'Programme': 'BSc Computer Science',
                'Email': 'john.doe@example.com'
            }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        ws['!cols'] = [
            { wch: 20 },
            { wch: 18 },
            { wch: 25 },
            { wch: 30 },
            { wch: 25 } 
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Students');
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

            <main className="flex-1 p-8 min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FaUserGraduate className="mr-3 text-blue-600" />
                            Student Management
                        </h2>
                        <p className="text-gray-500 mt-1">Manage student registrations and exam eligibility</p>
                        
                        {activeExam && (
                            <div className="mt-2 flex items-center text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full w-fit border border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Active Exam: <strong>{activeExam.title || `Exam ID: ${activeExam.id}`}</strong>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        {(currentUser?.role === 'super_admin' || currentUser?.role === 'level_admin') && (
                            <>
                                <button onClick={() => setShowImportModal(true)} className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
                                    <FaUpload className="mr-2 text-green-600" /> Import
                                </button>
                                <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all">
                                    <FaPlus className="mr-2" /> Register Student
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* Filters */}
                {currentUser?.role === 'super_admin' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Filter by Session</h3>
                        <LevelSelector
                            currentUser={currentUser}
                            selectedLevel={selectedLevel}
                            onLevelChange={setSelectedLevel}
                            showAllOption={true}
                        />
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or candidate number..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <FaSearch />
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    {currentUser?.role === 'super_admin' && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={currentUser?.role === 'super_admin' ? 5 : 4} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={currentUser?.role === 'super_admin' ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <FaUsers className="text-4xl mb-3 text-gray-300" />
                                                <p className="text-lg font-medium">No students found</p>
                                                <p className="text-sm">Try adjusting your search or add a new student.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {student.image ? (
                                                        <img
                                                            src={`${path.replace('/api', '')}/${student.image}`}
                                                            alt={student.full_name}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                            <FaUserGraduate />
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                                        <div className="text-sm text-gray-500 font-mono">{student.candidate_no}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-2">
                                                    <FaBuilding className="text-gray-400 text-xs" />
                                                    {student.department}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    <FaBookOpen className="text-gray-400 text-xs" />
                                                    {student.programme}
                                                </div>
                                            </td>
                                            {currentUser?.role === 'super_admin' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                                                        {student.level?.title || 'Not assigned'}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {student.ticket_no ? (
                                                        <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
                                                            <FaTicketAlt className="mr-1" />
                                                            {student.ticket_no}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No Ticket</span>
                                                    )}
                                                    
                                                    {student.time_extension > 0 && (
                                                        <span className="flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">
                                                            <FaClock className="mr-1" />
                                                            +{student.time_extension} mins
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditStudent(student)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
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
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                                                            title="Extend Time"
                                                        >
                                                            <FaClock />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredStudents.length > studentsPerPage && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{((currentPage - 1) * studentsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * studentsPerPage, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> students
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Student Modal - Redesigned */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Register New Student</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                            {errMsg && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{errMsg}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={newStudent.full_name}
                                    onChange={e => setNewStudent({ ...newStudent, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. STU/2024/001"
                                    value={newStudent.candidate_no}
                                    onChange={e => setNewStudent({ ...newStudent, candidate_no: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo (Optional)</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center px-4 py-2 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                            <FaUpload className="text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">Choose File</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setNewStudent({ ...newStudent, image: file });
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setImagePreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Only show department and programme fields for super admins */}
                            {currentUser?.role !== 'level_admin' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Computer Science"
                                            value={newStudent.department}
                                            onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. BSc Computer Science"
                                            value={newStudent.programme}
                                            onChange={e => setNewStudent({ ...newStudent, programme: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Students Modal - Redesigned */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Import Students</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleImportStudents} className="p-6 space-y-4">
                            {errMsg && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{errMsg}</div>}

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <p className="text-sm text-blue-800 mb-3 font-medium">Instructions</p>
                                <p className="text-xs text-blue-600 mb-3">Upload an Excel file (.xlsx) with columns: Full Name, Candidate Number, Department, Programme.</p>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                                >
                                    <FaDownload className="mr-1" /> Download Template
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input type="file" onChange={e => setFile(e.target.files[0])} accept=".xlsx, .xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">{file ? file.name : "Click to upload Excel file"}</p>
                                <p className="text-xs text-gray-400 mt-1">.xlsx or .xls files only</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isUploading ? "Importing..." : "Import"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Extend Time Modal - Redesigned */}
            {showExtendTimeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center">
                            <h3 className="font-bold text-amber-900 flex items-center">
                                <FaClock className="mr-2" /> Extend Time
                            </h3>
                            <button onClick={() => setShowExtendTimeModal(false)} className="text-amber-700 hover:text-amber-900"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleExtendTime} className="p-6 space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-500">Student</p>
                                <p className="font-bold text-gray-900 text-lg">{selectedStudent?.full_name}</p>
                                {selectedStudent?.time_extension > 0 && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                                        Currently +{selectedStudent.time_extension} mins
                                    </span>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Minutes</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={extensionMinutes}
                                        onChange={(e) => setExtensionMinutes(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-center font-mono text-lg"
                                        placeholder="0"
                                        autoFocus
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">min</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowExtendTimeModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-md">Add Time</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Student Modal - Redesigned */}
            {showEditModal && editingStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Edit Student</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
                            {errMsg && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{errMsg}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editingStudent.full_name}
                                    onChange={e => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Number</label>
                                <input
                                    type="text"
                                    value={editingStudent.candidate_no}
                                    onChange={e => setEditingStudent({ ...editingStudent, candidate_no: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center px-4 py-2 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                            <FaUpload className="text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">Change Photo</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEditingStudent({ ...editingStudent, image: file });
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setEditImagePreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    {editImagePreview && (
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                            <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {currentUser?.role !== 'level_admin' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            value={editingStudent.department}
                                            onChange={e => setEditingStudent({ ...editingStudent, department: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                                        <input
                                            type="text"
                                            value={editingStudent.programme}
                                            onChange={e => setEditingStudent({ ...editingStudent, programme: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md">Update Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;