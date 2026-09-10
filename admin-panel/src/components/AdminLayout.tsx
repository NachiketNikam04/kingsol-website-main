import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      {/* Fixed Independent Scrolling Sidebar */}
      <Sidebar />

      {/* Main Content Column Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Independent Scrolling Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
