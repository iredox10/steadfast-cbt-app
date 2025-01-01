const Model = ({ children }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative max-w-2xl w-full mx-4 animate-modal-fade-in">
                {children}
            </div>
        </div>
    );
};

export default Model;
