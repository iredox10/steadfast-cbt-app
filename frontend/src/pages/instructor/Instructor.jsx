import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const Instructor = () => {
    const { id } = useParams();
    const { data: courses, loading, err } = useFetch(`/get-lecturer-courses/${id}`);
    const {
        data: user,
        loading: userLoading,
        err: userErr,
    } = useFetch(`/get-user/${id}`);

    console.log(user);
    return (
        <div className="grid grid-cols-6 h-screen bg-gray-50">
            <Sidebar>
                <Link
                    to="#"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
                >
                    <i className="fas fa-book"></i>
                    <span>Courses</span>
                </Link>
            </Sidebar>
            <div className="col-span-5 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.full_name}
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your courses and exams</p>
                </div>

                {userLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses && courses.map((course) => (
                            <Link
                                key={course.course_id} 
                                to={`/exams/${id}/${course.course_id}`}
                                className="group block"
                            >
                                <div className="bg-white rounded-xl p-6 hover:bg-gradient-to-br from-blue-50 to-white transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-book-open text-white text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                                    {course.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {course.code || 'Course Code'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 group-hover:bg-blue-100 p-2 rounded-full transition-colors duration-200">
                                            <i className="fas fa-chevron-right text-gray-400 group-hover:text-blue-600"></i>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Instructor;
