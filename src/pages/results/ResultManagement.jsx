import React from 'react';
import { useTranslation } from 'react-i18next';
import ResultList from '../../components/results/ResultList';

const ResultManagement = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('results.title')}</h1>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">{t('results.description')}</p>
            </div>
            <ResultList />
        </div>
    );
};

export default ResultManagement;
