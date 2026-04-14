import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MemberForm from './MemberForm';

export default function AddMember() {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-[#0B65F6]" />
                        ഗ്രൂപ്പ് അംഗത്തെ ചേർക്കുക (Add Member)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Add a new member to a registered house.</p>
                </div>
                <Link
                    to="/family/member/register"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    തിരികെ പോവുക (Back)
                </Link>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8"
            >
                <MemberForm onSuccess={() => navigate('/family/member/register')} />
            </motion.div>
        </div>
    );
}
