// src/pages/Unauthorized.jsx
const Unauthorized = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
                <p className="text-lg">You don't have permission to access this page.</p>
            </div>
        </div>
    );
};

export default Unauthorized;