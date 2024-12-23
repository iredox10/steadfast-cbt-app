const Model = ({ children }) => {
    return (
        <div className="absolute z-20 top-0 left-0 bg-red-50/50  w-full h-screen">
            <div className="bg-primary-color shadow-lg absolute w-2/4 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] ">
                {children}
            </div>
        </div>
    );
};

export default Model;
