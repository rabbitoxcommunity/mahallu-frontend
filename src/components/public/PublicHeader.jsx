import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicHeader = ({ tenantName }) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Name */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Home size={20} className="text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                {tenantName || t('public.welcome')}
                            </h1>
                        </div>
                    </Link>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    i18n.language === 'en'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('ml')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    i18n.language === 'ml'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                മല
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;
