import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Users, FileText, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

export default function AddFamily() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            family_name: '',
            notes: '',
            is_active: true
        }
    });

    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await axios.post('/family/create', data);
            toast.success('Family registered successfully!');
            reset();
            navigate('/family/register');
        } catch (error) {
            // Error handling is managed by axios interceptor
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-[#0B65F6]" />
                        കുടുംബം ചേർക്കുക (Add Family)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Register a new family entity to the system.</p>
                </div>
                <Link
                    to="/family/register"
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Family Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            കുടുംബത്തിന്റെ പേര് (Family Name) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${
                                    errors.family_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                } rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                placeholder="ഉദാ: മാളിയേക്കൽ (e.g. Maliyekkal)"
                                {...register("family_name", { required: "Family Name is required" })}
                            />
                        </div>
                        {errors.family_name && (
                            <p className="mt-1.5 text-xs text-red-500">{errors.family_name.message}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            കുറിപ്പുകൾ (Notes)
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <FileText size={18} className="text-gray-400" />
                            </div>
                            <textarea
                                rows={4}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] focus:border-[#0B65F6] focus:outline-none transition-colors resize-none"
                                placeholder="കുടുംബത്തെക്കുറിച്ചുള്ള അധിക വിവരങ്ങൾ (Any additional notes...)"
                                {...register("notes")}
                            />
                        </div>
                    </div>

                    {/* Is Active Status (Checkbox) */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                {...register("is_active")}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] dark:peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0B65F6]"></div>
                        </label>
                        <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                സജീവം (Active Status)
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ഈ കുടുംബത്തെ സജീവമായി നിലനിർത്തുക
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-xs font-medium text-white bg-[#0B65F6] rounded-xl hover:bg-[#0B65F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B65F6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            സേവ് ചെയ്യുക (Save Family)
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
