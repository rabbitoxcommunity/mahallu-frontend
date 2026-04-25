import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, FileText, Home as HomeIcon, ArrowRight } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import { getTenantInfo } from '../../api/publicService';

const Home = () => {
    const { t } = useTranslation();
    const [tenantName, setTenantName] = useState('');

    useEffect(() => {
        // Fetch tenant info
        const fetchTenantInfo = async () => {
            try {
                // For local development, use query param
                const tenantParam = new URLSearchParams(window.location.search).get('tenant') || 'edakkulam-mahallu';
                const response = await getTenantInfo(tenantParam);
                if (response.success) {
                    setTenantName(response.data.name);
                }
            } catch (error) {
                console.error('Error fetching tenant info:', error);
            }
        };

        fetchTenantInfo();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <PublicHeader tenantName={tenantName} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                            <HomeIcon size={32} className="text-gray-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                        {t('public.welcome')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {tenantName}
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* Verify Family */}
                    <Link
                        to="/public/search"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <Search size={24} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('public.verify')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Search your family by mobile number or house name
                        </p>
                        <div className="flex items-center text-gray-900 font-medium">
                            {t('public.viewDetails')}
                            <ArrowRight size={18} className="ml-2" />
                        </div>
                    </Link>

                    {/* View Details */}
                    <Link
                        to="/public/search"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <HomeIcon size={24} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('public.viewDetails')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            View your family details and varisankhya status
                        </p>
                        <div className="flex items-center text-gray-900 font-medium">
                            {t('public.viewDetails')}
                            <ArrowRight size={18} className="ml-2" />
                        </div>
                    </Link>

                    {/* Apply Certificate */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 opacity-60 cursor-not-allowed">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText size={24} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('public.applyCertificate')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Apply for certificates online
                        </p>
                        <div className="flex items-center text-gray-600 font-medium">
                            {t('public.comingSoon')}
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                            Portal is active and ready to use
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
