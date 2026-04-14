import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, User, Users, Calendar, Heart, Shield, GraduationCap, Briefcase, Droplets, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import SearchableSelect from '../../components/ui/SearchableSelect';

export default function AddMember() {
    const [houses, setHouses] = useState([]);
    const [loadingHouses, setLoadingHouses] = useState(true);

    const methods = useForm({
        defaultValues: {
            house_id: '',
            full_name: '',
            dob: '',
            gender: 'Male',
            relation_to_head: '',
            whatsapp: '',
            email: '',
            yateem_status: false,
            marital_status: 'Single',
            religious_education: '',
            general_education: '',
            occupation: '',
            monthly_income: 0,
            blood_group: '',
            medical_notes: '',
            skills: '',
            is_family_head: false,
            is_active: true
        }
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = methods;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHouses = async () => {
            try {
                const { data } = await axios.get('/house', { params: { limit: 1000 } });
                setHouses(data.houses || []);
            } catch (error) {
                console.error("Error fetching houses", error);
            } finally {
                setLoadingHouses(false);
            }
        };
        fetchHouses();
    }, []);

    const onSubmit = async (data) => {
        try {
            await axios.post('/member/add', data);
            toast.success('Member added successfully!');
            reset();
        } catch (error) {
            // error handled by interceptor
        }
    };

    const houseOptions = houses.map(h => ({
        value: h._id,
        label: `${h.householder_name} (${h.house_code}) - ${h.family_id?.family_name || 'No Family'}`
    }));

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
    ];

    const maritalOptions = [
        { value: 'Single', label: 'Single' },
        { value: 'Married', label: 'Married' },
        { value: 'Widow', label: 'Widow' },
        { value: 'Divorced', label: 'Divorced' }
    ];

    return (
        <FormProvider {...methods}>
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
                        to="/family/register"
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Select House Section */}
                        <div className="bg-gray-50 dark:bg-[#16171d] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Info size={18} className="text-[#0B65F6]" />
                                വീട് തിരഞ്ഞെടുക്കുക (House Selection)
                            </h3>
                            <div className="max-w-md">
                                <SearchableSelect
                                    name="house_id"
                                    label="വീട് (House)"
                                    options={houseOptions}
                                    isLoading={loadingHouses}
                                    required={true}
                                    error={errors.house_id}
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">അടിസ്ഥാന വിവരങ്ങൾ (Basic Information)</h3>
                            </div>

                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    പൂർണ്ണനാമം (Full Name) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                            } rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                        placeholder="ഉദാ: അഹമ്മദ് കുട്ടി (e.g. Ahmed Kutty)"
                                        {...register("full_name", { required: "Full name is required" })}
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <SearchableSelect
                                    name="gender"
                                    label="ലിംഗം (Gender)"
                                    options={genderOptions}
                                />
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">ജനനത്തീയതി (Date of Birth)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                        {...register("dob")}
                                    />
                                </div>
                            </div>

                            {/* Relation to Head */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">നാഥനുമായുള്ള ബന്ധം (Relation to Head)</label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    placeholder="ഉദാ: മകൻ, ഭാര്യ (e.g. Son, Wife)"
                                    {...register("relation_to_head")}
                                />
                            </div>

                            {/* Marital Status */}
                            <div>
                                <SearchableSelect
                                    name="marital_status"
                                    label="വൈവാഹിക നില (Marital Status)"
                                    options={maritalOptions}
                                />
                            </div>
                        </div>

                        {/* Education & Work */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="md:col-span-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">വിദ്യാഭ്യാസവും തൊഴിലും (Education & Career)</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <GraduationCap size={16} /> മതവിദ്യാഭ്യാസം (Religious Education)
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    {...register("religious_education")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <GraduationCap size={16} /> പൊതു വിദ്യാഭ്യാസം (General Education)
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    {...register("general_education")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <Briefcase size={16} /> ജോലി (Occupation)
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    {...register("occupation")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">പ്രതിമാസ വരുമാനം (Monthly Income)</label>
                                <input
                                    type="number"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    {...register("monthly_income")}
                                />
                            </div>
                        </div>

                        {/* Health & Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="md:col-span-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ആരോഗ്യവും കഴിവുകളും (Health & Skills)</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <Droplets size={16} className="text-red-500" /> രക്തഗ്രൂപ്പ് (Blood Group)
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    placeholder="e.g. O+ve"
                                    {...register("blood_group")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">കഴിവുകൾ (Skills)</label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                    placeholder="e.g. Carpentry, Teaching"
                                    {...register("skills")}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">ആരോഗ്യ കുറിപ്പുകൾ (Medical Notes)</label>
                                <textarea
                                    rows={2}
                                    className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none resize-none"
                                    {...register("medical_notes")}
                                />
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" {...register("is_family_head")} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                                </label>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">കുടുംബനാഥൻ (Head)</span>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" {...register("yateem_status")} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                                </label>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">യത്തീം (Yateem)</span>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" {...register("is_active")} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                                </label>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">സജീവം (Active)</span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 text-xs font-semibold text-white bg-[#0B65F6] rounded-xl hover:bg-[#0653d1] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                അംഗത്തെ ചേർക്കുക (Save Member)
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </FormProvider>
    );
}
