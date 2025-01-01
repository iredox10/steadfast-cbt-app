import { Link } from 'react-router-dom';
import logo from '../../public/assets/logo.webp'
const Sidebar = ({children}) => {
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 to-black text-white">
            <Link to={'/'} className="flex flex-col items-center p-6">
                <img src={logo} className="w-16 h-16 object-contain" alt="HUK POLY Logo" />
            </Link>
            <div className="flex flex-col justify-between flex-1">
                <div className="flex flex-col gap-4 px-8 mt-8">
                    {children}
                </div>
                <div className="p-8 flex flex-col gap-4 text-gray-300">
                    <Link to="/" className="hover:text-white flex items-center gap-2">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Log out</span>
                    </Link>
                    <Link to="" className="hover:text-white flex items-center gap-2">
                        <i className="fas fa-question-circle"></i>
                        <span>Help Center</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
