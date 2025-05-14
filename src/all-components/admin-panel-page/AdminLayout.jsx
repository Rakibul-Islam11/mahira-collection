// all-components/admin-panel-page/AdminLayout.jsx
import React from 'react';
import AdminNavbar from './AdminNavbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <AdminNavbar />
            <div className="pt-10 p-0 md:p-2">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
