import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FamilyForm from './FamilyForm';

export default function AddFamily() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-[#0B65F6]" />
                        {t('family.addFamily')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('family.addDescription')}</p>
                </div>
                <Link
                    to="/family/register"
                    className="flex items-center justify-center gap-2 px-4 py-2.5  font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    {t('common.back')}
                </Link>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8"
            >
                <FamilyForm onSuccess={() => navigate('/family/register')} />
            </motion.div>
        </div>
    );
}
