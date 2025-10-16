import React, { useState, useEffect } from "react";
import axios from "axios";
import { path } from "../../utils/path";
import { FaTimes, FaTicketAlt, FaUser, FaCheck, FaClock, FaDownload } from 'react-icons/fa';

const ViewTicketsModal = ({ examId, courseName, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, available, used

    useEffect(() => {
        fetchTickets();
    }, [examId]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('Fetching tickets for exam:', examId);
            console.log('API URL:', `${path}/exam-tickets/${examId}`);
            console.log('Token exists:', !!token);
            
            const res = await axios.get(`${path}/exam-tickets/${examId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            console.log('Tickets data received:', res.data);
            setData(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching tickets:', err);
            console.error('Error response:', err.response);
            setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = data?.tickets?.filter(ticket => {
        // Filter by status
        if (filterStatus === 'available' && ticket.is_used) return false;
        if (filterStatus === 'used' && !ticket.is_used) return false;

        // Filter by search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                ticket.ticket_no.includes(search) ||
                ticket.student?.full_name?.toLowerCase().includes(search) ||
                ticket.student?.candidate_no?.toLowerCase().includes(search)
            );
        }

        return true;
    });

    const exportToCSV = () => {
        if (!data?.tickets) return;

        const headers = ['Ticket Number', 'Status', 'Student Name', 'Candidate Number', 'Department', 'Assigned At'];
        const rows = data.tickets.map(ticket => [
            ticket.ticket_no,
            ticket.status,
            ticket.student?.full_name || '-',
            ticket.student?.candidate_no || '-',
            ticket.student?.department || '-',
            ticket.assigned_at ? new Date(ticket.assigned_at).toLocaleString() : '-'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_${examId}_tickets.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const copyAvailableTickets = () => {
        const available = data?.tickets?.filter(t => !t.is_used).map(t => t.ticket_no);
        if (available && available.length > 0) {
            navigator.clipboard.writeText(available.join(', '));
            alert(`Copied ${available.length} available ticket numbers to clipboard!`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FaTicketAlt className="text-3xl" />
                            Exam Tickets
                        </h2>
                        <p className="text-blue-100 mt-1">{courseName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                                <p className="text-gray-600">Loading tickets...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                            <p className="font-semibold">Error loading tickets:</p>
                            <p>{error}</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {data.statistics.total}
                                            </p>
                                        </div>
                                        <FaTicketAlt className="text-4xl text-blue-300" />
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Available</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {data.statistics.available}
                                            </p>
                                        </div>
                                        <FaCheck className="text-4xl text-green-300" />
                                    </div>
                                </div>

                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Used</p>
                                            <p className="text-3xl font-bold text-orange-600">
                                                {data.statistics.used}
                                            </p>
                                        </div>
                                        <FaUser className="text-4xl text-orange-300" />
                                    </div>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Usage</p>
                                            <p className="text-3xl font-bold text-purple-600">
                                                {data.statistics.percentage_used}%
                                            </p>
                                        </div>
                                        <FaClock className="text-4xl text-purple-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by ticket number, student name, or candidate number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Tickets</option>
                                        <option value="available">Available Only</option>
                                        <option value="used">Used Only</option>
                                    </select>

                                    <button
                                        onClick={copyAvailableTickets}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                                        title="Copy available ticket numbers"
                                    >
                                        Copy Available
                                    </button>

                                    <button
                                        onClick={exportToCSV}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <FaDownload />
                                        Export CSV
                                    </button>
                                </div>
                            </div>

                            {/* Tickets Table */}
                            {filteredTickets && filteredTickets.length > 0 ? (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Ticket Number
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Student Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Candidate No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Department
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Assigned At
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTickets.map((ticket) => (
                                                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-lg font-mono font-bold text-blue-600">
                                                            {ticket.ticket_no}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            ticket.is_used
                                                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                                                : 'bg-green-100 text-green-800 border border-green-300'
                                                        }`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {ticket.student ? (
                                                            <div className="flex items-center gap-2">
                                                                <FaUser className="text-gray-400" />
                                                                <span className="font-medium text-gray-900">
                                                                    {ticket.student.full_name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Not assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {ticket.student?.candidate_no || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {ticket.student?.department || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {ticket.assigned_at ? (
                                                            <div>
                                                                <div>{new Date(ticket.assigned_at).toLocaleDateString()}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {new Date(ticket.assigned_at).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg">
                                        {searchTerm || filterStatus !== 'all'
                                            ? 'No tickets match your search criteria'
                                            : 'No tickets found for this exam'}
                                    </p>
                                </div>
                            )}

                            {/* Summary Footer */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                    <strong>Showing:</strong> {filteredTickets?.length || 0} of {data.statistics.total} tickets
                                    {searchTerm && <span> (filtered by "{searchTerm}")</span>}
                                </p>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        <p><strong>Tip:</strong> Available tickets can be given to students for login</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTicketsModal;
