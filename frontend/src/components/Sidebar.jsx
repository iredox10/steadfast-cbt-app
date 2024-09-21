import logo from '../../public/assets/logo.webp'
const Sidebar = ({children}) => {
    return (
        <div class="flex  flex-col h-screen bg-black text-white">
            <div class="flex flex-col items-center my-4">
                <img src={logo} class="w-16" alt="logo" />
                <h1 class="text-white">HUK POLY</h1>
            </div>
            <div class="flex flex-col justify-between gap-40">
                <div class="text-center w-full my-10 flex flex-col gap-5 items-start">
                   {children} 
                    <div></div>
                </div>
                <div class="p-4 flex justify-self-end flex-col">
                    <a href="">Log out</a>
                    <a href="">Help Center</a>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
