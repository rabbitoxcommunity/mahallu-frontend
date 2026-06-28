import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Moon, Sun, Building2 } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

const PortalNavbar = () => {
  const { t, i18n } = useTranslation();
  const { tenant }  = usePortal();
  const [open, setOpen]   = useState(false);
  const [dark, setDark]   = useState(() => document.documentElement.classList.contains('dark'));
  const slug = new URLSearchParams(window.location.search).get('t') || localStorage.getItem('portal_tenant') || '';
  const qs   = slug ? `?t=${slug}` : '';

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
    { to: `/portal${qs}`,               label: t('portal.nav.home') },
    { to: `/portal/services${qs}`,      label: t('portal.nav.services') },
    { to: `/portal/announcements${qs}`, label: t('portal.nav.announcements') },
    { to: `/portal/about${qs}`,         label: t('portal.nav.about') },
    { to: `/portal/contact${qs}`,       label: t('portal.nav.contact') },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a1b20]/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo + Name */}
        <Link to={`/portal${qs}`} className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
            {tenant?.name || t('portal.mahallu')}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleLang}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold">
            {i18n.language === 'ml' ? 'EN' : 'മ'}
          </button>
          <button onClick={toggleDark}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => setOpen(o => !o)}
            className="md:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1b20] px-4 py-3 flex flex-col gap-3">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default PortalNavbar;
