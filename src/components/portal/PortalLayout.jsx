import React, { useEffect } from 'react';
import PortalNavbar from './PortalNavbar';
import PortalFooter from './PortalFooter';
import { usePortal } from '../../context/PortalContext';
import { motion } from 'framer-motion';

const PortalLayout = ({ children }) => {
  const { tenant } = usePortal();

  useEffect(() => {
    const color = tenant?.theme_color || '#2563eb';
    document.documentElement.style.setProperty('--portal-theme', color);
  }, [tenant?.theme_color]);

  return (
  <div className="min-h-screen flex flex-col bg-[#fafafc] dark:bg-[#050505] text-slate-900 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-500">
    
    {/* 2026 Aurora Mesh Gradient Background */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-violet-200/40 to-blue-200/40 dark:from-violet-900/20 dark:to-blue-900/20 rounded-[100%] blur-[120px] mix-blend-multiply dark:mix-blend-lighten"
      />
      <motion.div 
        animate={{ 
          rotate: [0, -5, 5, 0],
          scale: [1, 0.95, 1.05, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] -right-[10%] w-[60%] h-[80%] bg-gradient-to-br from-cyan-200/40 to-emerald-100/40 dark:from-cyan-900/20 dark:to-emerald-900/10 rounded-[100%] blur-[130px] mix-blend-multiply dark:mix-blend-lighten"
      />
      <motion.div 
        animate={{ 
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] left-[20%] w-[80%] h-[60%] bg-gradient-to-tr from-rose-200/30 to-orange-100/30 dark:from-rose-900/10 dark:to-orange-900/10 rounded-[100%] blur-[140px] mix-blend-multiply dark:mix-blend-lighten"
      />
      {/* Noise overlay for premium texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZUZpbHRlcikiLz4KPC9zdmc+')]"></div>
    </div>

    <PortalNavbar />
    
    <main className="flex-1 w-full relative z-10 flex flex-col">
      {children}
    </main>
    
    <PortalFooter />
  </div>
  );
};

export default PortalLayout;
