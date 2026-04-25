import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, TrendingUp, Smartphone, Database } from 'lucide-react';

const Benefits = () => {
    const { t } = useTranslation();

    const benefits = [
        {
            icon: Eye,
            key: 'transparency',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: TrendingUp,
            key: 'easyTracking',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: Smartphone,
            key: 'mobileFriendly',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            icon: Database,
            key: 'centralized',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {t('website.benefits.title')}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('website.benefits.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={benefit.key}
                                className="text-center"
                            >
                                <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                    <Icon size={32} className={benefit.color} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {t(`website.benefits.${benefit.key}.title`)}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {t(`website.benefits.${benefit.key}.description`)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
