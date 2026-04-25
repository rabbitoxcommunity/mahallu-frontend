import React from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, TrendingUp, Receipt, BarChart3, Globe, Languages } from 'lucide-react';

const Features = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: Coins,
            key: 'varisankhya',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: TrendingUp,
            key: 'income',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: Receipt,
            key: 'expense',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: BarChart3,
            key: 'reports',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: Globe,
            key: 'publicPortal',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: Languages,
            key: 'multilanguage',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
    ];

    return (
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {t('website.features.title')}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('website.features.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.key}
                                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                                    <Icon size={24} className={feature.color} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {t(`website.features.${feature.key}.title`)}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {t(`website.features.${feature.key}.description`)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
