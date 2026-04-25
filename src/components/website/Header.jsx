import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';

const Header = () => {
    const { t, i18n } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const navItems = [
        { key: 'home', label: t('website.header.home'), href: '/' },
        { key: 'features', label: t('website.header.features'), href: '#features' },
        { key: 'contact', label: t('website.header.contact'), href: '#contact' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                            {t('website.header.logo')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.key}
                                href={item.href}
                                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Language Switcher */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    i18n.language === 'en'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('ml')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    i18n.language === 'ml'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                മല
                            </button>
                        </div>

                        {/* Login Button */}
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            {t('website.header.login')}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-4 space-y-3">
                        {navItems.map((item) => (
                            <a
                                key={item.key}
                                href={item.href}
                                className="block text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe size={16} className="text-gray-500" />
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => changeLanguage('en')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            i18n.language === 'en'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        EN
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('ml')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            i18n.language === 'ml'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        മല
                                    </button>
                                </div>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('website.header.login')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
