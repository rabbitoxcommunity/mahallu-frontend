import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                        {t('website.hero.title')}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                        {t('website.hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="#features"
                            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            {t('website.hero.exploreFeatures')}
                            <ArrowRight size={18} className="ml-2" />
                        </a>
                        <Link
                            to="/public"
                            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t('website.hero.visitPortal')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
