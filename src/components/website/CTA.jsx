import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
    const { t } = useTranslation();

    return (
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    {t('website.cta.title')}
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    {t('website.cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:contact@mahallucrm.com"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                        {t('website.cta.contactUs')}
                        <ArrowRight size={18} className="ml-2" />
                    </a>
                    <a
                        href="mailto:demo@mahallucrm.com"
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                    >
                        {t('website.cta.requestDemo')}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CTA;
