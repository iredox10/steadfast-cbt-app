import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { manuals } from '../utils/manualContent';
import { FaArrowLeft, FaBook, FaChevronRight, FaBars, FaTimes } from 'react-icons/fa';

const UserManual = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const content = manuals[role] || "# Manual Not Found\n\nSorry, the requested manual could not be found.";
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Extract headings for Table of Contents
    useEffect(() => {
        const lines = content.split('\n');
        const extractedHeadings = lines
            .filter(line => line.startsWith('## ') || line.startsWith('### '))
            .map(line => {
                const level = line.startsWith('### ') ? 3 : 2;
                const text = line.replace(/^#{2,3}\s+/, '');
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                return { level, text, id };
            });
        setHeadings(extractedHeadings);
    }, [content]);

    // Handle scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsSidebarOpen(false);
        }
    };

    // Custom renderer for ReactMarkdown to add IDs to headings
    const components = {
        h2: ({ children }) => {
            const id = children[0]?.toString().toLowerCase().replace(/[^\w]+/g, '-');
            return <h2 id={id} className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">{children}</h2>;
        },
        h3: ({ children }) => {
            const id = children[0]?.toString().toLowerCase().replace(/[^\w]+/g, '-');
            return <h3 id={id} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h3>;
        },
        p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        blockquote: ({ children }) => (
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg my-6 text-gray-700 italic">
                {children}
            </div>
        ),
        code: ({ inline, className, children }) => {
            if (inline) {
                return <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">{children}</code>;
            }
            return (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono">
                    {children}
                </div>
            );
        }
    };

    const formatRoleName = (r) => {
        if (!r) return 'Manual';
        return r.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Guide';
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-600">
                        <FaArrowLeft />
                    </button>
                    <span className="font-bold text-gray-800">Documentation</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600">
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Sidebar / TOC */}
            <aside className={`
                fixed md:sticky top-0 h-screen w-72 bg-gray-50 border-r border-gray-200 
                transform transition-transform duration-300 z-20 flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="mb-8">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
                        >
                            <FaArrowLeft /> Back to App
                        </button>
                        <div className="flex items-center gap-3 text-blue-700">
                            <FaBook className="text-2xl" />
                            <h1 className="font-bold text-lg leading-tight">
                                {formatRoleName(role)}
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">On this page</h2>
                        <nav className="space-y-1">
                            {headings.map((heading, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToSection(heading.id)}
                                    className={`
                                        w-full text-left py-2 px-3 rounded-lg text-sm transition-colors duration-200
                                        ${activeId === heading.id 
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                        ${heading.level === 3 ? 'pl-8' : ''}
                                    `}
                                >
                                    {heading.text}
                                </button>
                            ))}
                        </nav>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200 mt-auto">
                        <p className="text-xs text-gray-400 text-center">
                            BUK CBT Documentation v1.0
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Hero / Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-12 md:py-16">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-4">
                            <span>Documentation</span>
                            <FaChevronRight className="text-xs" />
                            <span>{formatRoleName(role)}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                            {formatRoleName(role)}
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
                            Everything you need to know about managing your tasks and navigating the platform effectively.
                        </p>
                    </div>
                </div>

                {/* Markdown Content */}
                <div className="px-6 py-12 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <article className="prose prose-lg prose-slate max-w-none">
                            <ReactMarkdown components={components}>
                                {content}
                            </ReactMarkdown>
                        </article>
                    </div>
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default UserManual;