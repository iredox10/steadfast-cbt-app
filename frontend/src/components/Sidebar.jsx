import { Link } from 'react-router-dom';
import logo from '../../public/assets/buk.png';
import { FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ children }) => {
    return (
        <div className="w-64 bg-white flex-shrink-0 border-r border-gray-200 flex flex-col h-screen">
            <div className="flex flex-col items-center p-6 border-b border-gray-200">
                <img src={logo} className="w-16 h-16 object-contain" alt="HUK POLY Logo" />
                <h1 className="text-xl font-bold text-gray-900 mt-2">BUK KANO</h1>
            </div>

            <div className="flex flex-col justify-between flex-1">
                <div className="flex flex-col gap-2 px-4 py-6">
                    {children}
                </div>

                <div className="p-6 border-t border-gray-200">
                    <Link 
                        to="/admin-login" 
                        onClick={() => localStorage.removeItem('token')}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <FaSignOutAlt />
                        <span>Log out</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
