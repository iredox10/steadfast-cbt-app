import React, { useState, useEffect } from "react";
import GridLayout from "../../components/GridLayout";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FaUsers, FaBook, FaChalkboardTeacher, FaCalendarAlt } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const Dashboard = () => {
    const { userId } = useParams();
    const { data: user, loading: userLoading } = useFetch(`/get-user/${userId}`);
    
    // Add new data fetching for stats
    const { data: statsData, loading: statsLoading } = useFetch('/dashboard-stats');

    const stats = [
        {
            title: "Total Students",
            value: statsLoading ? "..." : statsData?.total_students || "0",
            icon: <FaUsers className="text-blue-500 text-3xl" />,
            change: "+12%",
            trend: "up"
        },
        {
            title: "Active Courses", 
            value: statsLoading ? "..." : statsData?.active_courses || "0",
            icon: <FaBook className="text-green-500 text-3xl" />,
            change: "+5%",
            trend: "up"
        },
        {
            title: "Instructors",
            value: statsLoading ? "..." : statsData?.total_instructors || "0",
            icon: <FaChalkboardTeacher className="text-purple-500 text-3xl" />,
            change: "-2%", 
            trend: "down"
        },
        {
            title: "Academic Sessions",
            value: statsLoading ? "..." : statsData?.academic_sessions || "0",
            icon: <FaCalendarAlt className="text-orange-500 text-3xl" />,
            change: "0%",
            trend: "neutral"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <GridLayout>
                <Sidebar />
                <div className="col-start-2 col-end-7 p-8">
                    <Header 
                        title={`Welcome back, ${user?.name || 'Admin'}`}
                        subtitle="Here's what's happening in your institution"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-500 text-sm">{stat.title}</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className={`flex items-center text-sm ${
                                    stat.trend === 'up' ? 'text-green-600' : 
                                    stat.trend === 'down' ? 'text-red-600' : 
                                    'text-gray-600'
                                }`}>
                                    <span className="font-medium">{stat.change}</span>
                                    <span className="ml-1">vs last month</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/admin-sessions" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                    <h4 className="font-medium text-blue-900">Manage Sessions</h4>
                                    <p className="text-sm text-blue-700 mt-1">View and edit academic sessions</p>
                                </Link>
                                <Link to={`/admin-students/${user?.id}`} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                    <h4 className="font-medium text-green-900">Student Records</h4>
                                    <p className="text-sm text-green-700 mt-1">Manage student information</p>
                                </Link>
                                <Link to="/admin-instructors" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                    <h4 className="font-medium text-purple-900">Instructors</h4>
                                    <p className="text-sm text-purple-700 mt-1">Manage Instructors</p>
                                </Link>
                                <Link to={`/admin-dashboard/${user?.id}`} className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                    <h4 className="font-medium text-orange-900">Course Catalog</h4>
                                    <p className="text-sm text-orange-700 mt-1">View and manage submitted courses</p>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Archives</h3>
                            <div className="p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-yellow-900">Access Archives</h4>
                                        <p className="text-sm text-yellow-700 mt-1">View and manage past examinations</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                </div>
                                <Link to='/exam-archives' className="mt-4 inline-block text-yellow-700 hover:text-yellow-800 font-medium">
                                    Access Archives →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </GridLayout>
        </div>
    );
};

export default Dashboard;
