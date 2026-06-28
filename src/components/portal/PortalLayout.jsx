import React from 'react';
import PortalNavbar from './PortalNavbar';
import PortalFooter from './PortalFooter';

// PortalProvider must be an ancestor of all portal routes (wired in App.jsx).
// PortalLayout only provides the visual shell.
const PortalLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#111217] text-gray-900 dark:text-white">
    <PortalNavbar />
    <main className="flex-1 w-full">
      {children}
    </main>
    <PortalFooter />
  </div>
);

export default PortalLayout;
