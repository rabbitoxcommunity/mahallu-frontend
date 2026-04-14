import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Home, Calendar, Phone, Mail, Droplets, Briefcase, GraduationCap, Heart, Activity, Stethoscope, Star } from 'lucide-react';
import axios from '../../api/axios';

export default function MemberDetailedView() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMember = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/member/${id}`);
            setMember(res.data);
        } catch (error) {
            console.error("Error fetching member details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMember();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#0B65F6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 text-center">
                <User size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">അംഗത്തെ കണ്ടെത്താനായില്ല (Member Not Found)</h2>
                <button onClick={() => navigate('/family/member/register')} className="text-[#0B65F6] hover:underline mt-4">
                    പട്ടികയിലേക്ക് മടങ്ങുക (Go back to list)
                </button>
            </div>
        );
    }

    const calculateAge = (dob) => {
        if (!dob) return "-";
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        return `${age} Years Old`;
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-[#0B65F6]" />
                        അംഗത്തിന്റെ വിവരങ്ങൾ (Member Details)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed view of a registered member.</p>
                </div>
                <button
                    onClick={() => navigate('/family/member/register')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    തിരികെ പോവുക (Back)
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Master Member Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1f25] rounded-2xl p-6 shadow-sm flex flex-col w-full"
                >
                    {/* Card Header */}
                    <div className="flex md:flex-row flex-col md:items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#0B65F6]/10 text-[#0B65F6] rounded-2xl flex items-center justify-center shrink-0">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-1">{member.full_name}</h3>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                    {member.relation_to_head || "Member"}
                                    {member.is_family_head && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] rounded-md uppercase font-bold tracking-wider ml-1">
                                            Head
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto ml-[80px] md:ml-0">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${member.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {member.is_active ? 'Active Status' : 'Inactive Status'}
                            </span>
                            {member.yateem_status && (
                                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`}>
                                    Yateem (Orphan)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card Body - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                        
                        {/* Section: Basic Details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Basic Information</h4>
                            
                            <div className="flex items-start gap-3">
                                <Home size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">വീട് (House)</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                                        {member.house_id?.householder_name || "-"} <span className="text-gray-400 text-xs text-normal">({member.house_id?.house_code})</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">ജനനത്തീയതി / വയസ്സ് (DOB & Age)</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                                        {member.dob ? new Date(member.dob).toLocaleDateString() : "-"} <span className="text-gray-400 text-xs">({calculateAge(member.dob)})</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">ലിംഗം (Gender)</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.gender}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">വൈവാഹിക നില</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.marital_status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact & Education */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Contact & Education</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-[#0B65F6] mt-0.5 shrink-0" />
                                    <div className="min-w-0 break-all">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">WhatsApp</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.whatsapp || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                    <div className="min-w-0 break-all">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Email</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.email || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <GraduationCap size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">പൊതു വിദ്യാഭ്യാസം</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.general_education || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">മതവിദ്യാഭ്യാസം</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.religious_education || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Career & Health */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Career & Health</h4>
                            
                            <div className="flex items-start gap-3">
                                <Briefcase size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">ജോലി (Occupation)</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.occupation || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">ശമ്പളം (Income)</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.monthly_income > 0 ? `₹${member.monthly_income}` : "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Droplets size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">രക്തഗ്രൂപ്പ് (Blood Group)</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-bold text-red-600 dark:text-red-400 tracking-wide">{member.blood_group || "-"}</p>
                                </div>
                            </div>

                            {member.skills && (
                                <div className="flex items-start gap-3">
                                    <Star size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">കഴിവുകൾ (Skills)</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{member.skills}</p>
                                    </div>
                                </div>
                            )}

                            {member.medical_notes && (
                                <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3 border border-red-100 dark:border-red-500/20 mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Stethoscope size={12} className="text-red-500" />
                                        <p className="text-[10px] text-red-600 dark:text-red-400 uppercase tracking-wider font-bold">ആരോഗ്യ കുറിപ്പുകൾ (Medical Notes)</p>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">{member.medical_notes}</p>
                                </div>
                            )}
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
