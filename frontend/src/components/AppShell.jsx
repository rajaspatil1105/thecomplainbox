import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * AppShell Component
 * Main layout wrapper with sidebar, topbar, and content area
 */
const AppShell = ({ children, pageTitle = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F0F0F0]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="page-container section-padding">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
