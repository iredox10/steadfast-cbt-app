import { Link } from 'react-router-dom';
import logo from '../../public/assets/logo.webp'
const Sidebar = ({children}) => {
    return (
        <div className="flex  flex-col h-screen bg-black text-white">
            <Link to={'/'} className="flex flex-col items-center my-4">
                <img src={logo} class="w-16" alt="logo" />
                <h1 className="text-white">HUK POLY</h1>
            </Link>
            <div className="flex flex-col justify-between gap-40">
                <div className="text-center w-full my-10 flex flex-col gap-5 items-start justify pl-10">
                   {children} 
                    <div></div>
                </div>
                <div className="p-4 pl-10 flex justify-self-end flex-col">
                    <Link to="/">Log out</Link>
                    <Link to="">Help Center</Link>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
