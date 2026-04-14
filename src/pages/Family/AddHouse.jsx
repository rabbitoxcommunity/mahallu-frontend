import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Home, FileText, Phone, MapPin, Users, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import SearchableSelect from '../../components/ui/SearchableSelect';

export default function AddHouse() {
    const [families, setFamilies] = useState([]);
    const [loadingFamilies, setLoadingFamilies] = useState(true);

    const methods = useForm({
        defaultValues: {
            family_id: '',
            householder_name: '',
            address: '',
            primary_contact: '',
            economic_status: 'Normal',
            zakat_eligible: false,
            notes: '',
            is_active: true
        }
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = methods;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFamilies = async () => {
            try {
                const { data } = await axios.get('/family', { params: { limit: 100 } });
                setFamilies(data.families || []);
            } catch (error) {
                console.error("Error fetching families", error);
            } finally {
                setLoadingFamilies(false);
            }
        };
        fetchFamilies();
    }, []);

    const onSubmit = async (data) => {
        try {
            await axios.post('/house/create', data);
            toast.success('House registered successfully!');
            reset();
            navigate('/family/house/register');
        } catch (error) {
            // error handled by axios interceptor
        }
    };

    const familyOptions = families.map(f => ({
        value: f._id,
        label: `${f.family_name} (${f.family_code})`
    }));

    const economicOptions = [
        { value: 'Normal', label: 'Normal' },
        { value: 'Miskeen', label: 'Miskeen' },
        { value: 'Poor', label: 'Poor' }
    ];

    return (
        <FormProvider {...methods}>
            <div className="w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Home className="text-[#0B65F6]" />
                            കുടുംബ വീട് ചേർക്കുക (Add House)
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Register a house and link it to a family.</p>
                    </div>
                    <Link
                        to="/family/house/register"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        തിриകെ പോവുക (Back)
                    </Link>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Family Selection */}
                            <div className="md:col-span-2">
                                <SearchableSelect
                                    name="family_id"
                                    label="കുടുംബം തിരഞ്ഞെടുക്കുക (Select Family)"
                                    options={familyOptions}
                                    icon={Users}
                                    required={true}
                                    isLoading={loadingFamilies}
                                    error={errors.family_id}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    വീട്ടുടമയുടെ പേര് (Householder Name) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Home size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${errors.householder_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                            } rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                        placeholder="ഉദാ: മുഹമ്മദ് ഇക്ക (e.g. Muhammad Ikka)"
                                        {...register("householder_name", { required: "Householder Name is required" })}
                                    />
                                </div>
                                {errors.householder_name && (
                                    <p className="mt-1.5 text-xs text-red-500">{errors.householder_name.message}</p>
                                )}
                            </div>

                            {/* Primary Contact */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    പ്രാഥമിക കോൺടാക്റ്റ് (Primary Contact) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${errors.primary_contact ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                            } rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                        placeholder="9876543210"
                                        {...register("primary_contact", { required: "Contact Number is required" })}
                                    />
                                </div>
                                {errors.primary_contact && (
                                    <p className="mt-1.5 text-xs text-red-500">{errors.primary_contact.message}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    മേൽവിലാസം (Address)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <MapPin size={18} className="text-gray-400" />
                                    </div>
                                    <textarea
                                        rows={3}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] focus:border-[#0B65F6] focus:outline-none transition-colors resize-none"
                                        placeholder="വീടിന്റെ പൂർണ്ണമായ മേൽവിലാസം (Full house address...)"
                                        {...register("address")}
                                    />
                                </div>
                            </div>

                            {/* Economic Status */}
                            <div>
                                <SearchableSelect
                                    name="economic_status"
                                    label="സാമ്പത്തിക നില (Economic Status)"
                                    options={economicOptions}
                                    error={errors.economic_status}
                                />
                            </div>

                            {/* Zakat Eligible (Checkbox) */}
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800 h-fit self-end">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        {...register("zakat_eligible")}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] dark:peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0B65F6]"></div>
                                </label>
                                <div>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                        സകാത്തിന് അർഹത (Zakat Eligible)
                                    </p>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    കുറിപ്പുകൾ (Notes)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText size={18} className="text-gray-400" />
                                    </div>
                                    <textarea
                                        rows={2}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] focus:border-[#0B65F6] focus:outline-none transition-colors resize-none"
                                        placeholder="കൂടുതൽ വിവരങ്ങൾ (Additional notes...)"
                                        {...register("notes")}
                                    />
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800 md:col-span-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        {...register("is_active")}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] dark:peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0B65F6]"></div>
                                </label>
                                <div>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">സജീവം (Active Status)</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-xs font-medium text-white bg-[#0B65F6] rounded-xl hover:bg-[#0B65F6]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B65F6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                വീട് സേവ് ചെയ്യുക (Save House)
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </FormProvider>
    );
}
