import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Moon, Sun, Building2, Globe } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { motion, AnimatePresence } from 'framer-motion';

const PortalNavbar = () => {
  const { t, i18n } = useTranslation();
  const { tenant }  = usePortal();
  const [open, setOpen]   = useState(false);
  const [dark, setDark]   = useState(() => document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);

  const slug       = new URLSearchParams(window.location.search).get('t') || localStorage.getItem('portal_tenant') || '';
  const qs         = slug ? `?t=${slug}` : '';
  const themeColor = tenant?.theme_color || '#2563eb';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const toggleLang = () => {
    const next = i18n.language === 'ml' ? 'en' : 'ml';
    i18n.changeLanguage(next);
  };

  const navLinks = [
    { to: `/portal${qs}`,               label: t('portal.nav.home', { defaultValue: 'Home' }), end: true },
    { to: `/portal/services${qs}`,      label: t('portal.nav.services', { defaultValue: 'Services' }) },
    tenant?.services?.announcements !== false && { to: `/portal/announcements${qs}`, label: t('portal.nav.announcements', { defaultValue: 'Announcements' }) },
    tenant?.services?.about_page    !== false && { to: `/portal/about${qs}`,         label: t('portal.nav.about', { defaultValue: 'About' }) },
    tenant?.services?.contact_page  !== false && { to: `/portal/contact${qs}`,       label: t('portal.nav.contact', { defaultValue: 'Contact' }) },
  ].filter(Boolean);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-6 px-4 sm:px-6 flex justify-center pointer-events-none">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`pointer-events-auto transition-all duration-500 w-full max-w-6xl rounded-full flex items-center justify-between px-5 sm:px-6 py-3.5
          ${scrolled 
            ? 'bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
            : 'bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/5 shadow-sm'}
        `}
      >
        
        {/* Logo + Name */}
        <Link to={`/portal${qs}`} className="flex items-center gap-3 min-w-0 group">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)`, boxShadow: `0 4px 12px ${themeColor}40` }}>
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-base text-gray-900 dark:text-white truncate tracking-tight">
            {tenant?.name || t('portal.mahallu')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `text-sm font-bold tracking-tight transition-all relative py-1 px-1 ${
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: themeColor }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleLang}
            className="hidden sm:flex items-center gap-2 justify-center px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-extrabold bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-md hover:border-blue-500/30 transition-all border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-md hover:scale-105 active:scale-95 group">
            <Globe size={14} className="text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span>{i18n.language === 'ml' ? 'English' : 'മലയാളം'}</span>
          </button>
          
          <button onClick={() => setOpen(!open)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-800 dark:text-white hover:bg-white/50 dark:hover:bg-white/10 transition-all">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-24 left-4 right-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden pointer-events-auto lg:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-2">
              {navLinks.map(l => (
                <NavLink 
                  key={l.to} 
                  to={l.to} 
                  end={l.end}
                  onClick={() => setOpen(false)} 
                  className={({ isActive }) => 
                    `text-lg font-bold py-3 px-4 rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              
              <div className="h-px bg-gray-200/50 dark:bg-gray-800/50 my-4"></div>
              
              <div className="flex gap-4 px-4">
                <button onClick={() => { toggleLang(); setOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-sm font-bold text-white dark:text-gray-900 hover:scale-[1.02] transition-transform group">
                  <Globe size={16} className="text-gray-400 group-hover:text-white dark:group-hover:text-gray-900 transition-colors" />
                  <span>Switch to {i18n.language === 'ml' ? 'English' : 'മലയാളം'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PortalNavbar;
