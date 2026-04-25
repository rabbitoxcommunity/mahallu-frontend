import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Users, Wallet, FileText, Globe } from 'lucide-react';

const HowItWorks = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: Building2,
            key: 'step1',
            number: '01'
        },
        {
            icon: Users,
            key: 'step2',
            number: '02'
        },
        {
            icon: Wallet,
            key: 'step3',
            number: '03'
        },
        {
            icon: FileText,
            key: 'step4',
            number: '04'
        },
        {
            icon: Globe,
            key: 'step5',
            number: '05'
        },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {t('website.howItWorks.title')}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('website.howItWorks.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.key} className="relative">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Icon size={32} className="text-gray-600" />
                                    </div>
                                    <div className="text-4xl font-bold text-gray-200 mb-4">
                                        {step.number}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {t(`website.howItWorks.${step.key}.title`)}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {t(`website.howItWorks.${step.key}.description`)}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-x-8" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
