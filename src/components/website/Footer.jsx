import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                            {t('website.header.logo')}
                        </span>
                    </div>

                    <div className="flex items-center gap-8 text-sm text-gray-600">
                        <a href="#" className="hover:text-gray-900 transition-colors">
                            {t('website.footer.privacy')}
                        </a>
                        <a href="#" className="hover:text-gray-900 transition-colors">
                            {t('website.footer.terms')}
                        </a>
                        <a href="#contact" className="hover:text-gray-900 transition-colors">
                            {t('website.footer.contact')}
                        </a>
                    </div>

                    <p className="text-sm text-gray-500">
                        © 2024 {t('website.header.logo')}. {t('website.footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
