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
                <div className="text-center w-full my-10 flex flex-col gap-5 items-start">
                   {children} 
                    <div></div>
                </div>
                <div className="p-4 flex justify-self-end flex-col">
                    <a href="">Log out</a>
                    <a href="">Help Center</a>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
