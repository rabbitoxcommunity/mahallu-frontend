import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, MapPin, Phone, Users, User, Calendar, Droplets, Briefcase, Heart, Edit, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import DataTable from '../../components/ui/DataTable';

export default function HouseDetailedView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [house, setHouse] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch house details
            const houseRes = await axios.get(`/house/${id}`);
            setHouse(houseRes.data);

            // Fetch house members
            const memberRes = await axios.get(`/member/house/${id}`, {
                params: {
                    page: currentPage,
                    limit: itemsPerPage
                }
            });
            setMembers(memberRes.data.members || []);
            setTotalEntries(memberRes.data.total || 0);
            setTotalPages(memberRes.data.pages || 0);
            
        } catch (error) {
            console.error("Error fetching house details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, currentPage, itemsPerPage]);

    if (loading && !house) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#0B65F6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!house) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 text-center">
                <Home size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">വീട് വിവരങ്ങൾ ലഭ്യമല്ല (House Not Found)</h2>
                <button onClick={() => navigate('/family/house/register')} className="text-[#0B65F6] hover:underline mt-4">
                    പട്ടികയിലേക്ക് മടങ്ങുക (Go back to list)
                </button>
            </div>
        );
    }

    const memberColumns = [
        {
            header: "പേര് (Name)",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B65F6]/10 flex items-center justify-center text-[#0B65F6]">
                        <User size={14} />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {row.full_name}
                            {row.is_family_head && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[9px] rounded-md uppercase font-bold tracking-wider">Head</span>}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{row.relation_to_head || "Member"}</div>
                    </div>
                </div>
            )
        },
        {
            header: "ജനനത്തീയതി / വയസ്സ് (DOB / Age)",
            cell: (row) => {
                if (!row.dob) return "-";
                const date = new Date(row.dob).toLocaleDateString() || "-";
                const age = new Date().getFullYear() - new Date(row.dob).getFullYear();
                return (
                    <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200">{date}</span>
                        <span className="text-[10px] text-gray-500">{age} Years Old</span>
                    </div>
                );
            }
        },
        {
            header: "വിവരങ്ങൾ (Details)",
            cell: (row) => (
                <div className="flex flex-col text-[11px] space-y-1">
                    {row.whatsapp && <div className="flex flex-wrap items-center gap-1.5 text-gray-600 dark:text-gray-400"><Phone size={10}/> {row.whatsapp}</div>}
                    {row.blood_group && <div className="flex flex-wrap items-center gap-1.5 text-red-500"><Droplets size={10}/> {row.blood_group}</div>}
                    {row.occupation && <div className="flex flex-wrap items-center gap-1.5 text-gray-600 dark:text-gray-400"><Briefcase size={10}/> {row.occupation}</div>}
                </div>
            )
        },
        {
            header: "സ്റ്റാറ്റസ് (Status)",
            cell: (row) => row.is_deceased ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {t('family.deceased')}
                </span>
            ) : (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {row.is_active ? t('family.active') : t('family.inactive')}
                </span>
            )
        }
    ];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Home className="text-[#0B65F6]" />
                        വീടിന്റെ വിവരങ്ങൾ (House Details)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed view of house and its members.</p>
                </div>
                <button
                    onClick={() => navigate('/family/house/register')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5  font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    തിരികെ പോവുക (Back)
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {/* House Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1f25] rounded-2xl p-6 shadow-sm flex flex-col w-full"
                >
                    <div className="flex md:flex-row flex-col md:items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#0B65F6]/10 text-[#0B65F6] rounded-xl flex items-center justify-center shrink-0">
                                <Home size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{house.householder_name}</h3>
                                <div className=" text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-2">
                                    {house.house_code}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto ml-[60px] md:ml-0">
                            <span className={`inline-block px-3 py-1 rounded-lg  font-bold ${house.economic_status === 'Poor' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                house.economic_status === 'Miskeen' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {house.economic_status}
                            </span>
                            {house.zakat_eligible && (
                                <span className={`inline-block px-3 py-1 rounded-lg  font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}>
                                    Zakat Eligible
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <Users size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">കുടുംബം (Family)</p>
                                <p className=" text-gray-900 dark:text-gray-200 font-medium">
                                    {house.family_id?.family_name || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">കോൺടാക്റ്റ് (Contact)</p>
                                <p className=" text-gray-900 dark:text-gray-200 font-medium">
                                    {house.primary_contact || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">മേൽവിലാസം (Address)</p>
                                <p className=" text-gray-900 dark:text-gray-200 font-medium leading-relaxed">
                                    {house.address || "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {house.notes && (
                        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3 border border-orange-100 dark:border-orange-500/20 mt-6">
                            <p className="text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-wider font-bold mb-1">കുറിപ്പുകൾ (Notes)</p>
                            <p className=" text-gray-700 dark:text-gray-300">{house.notes}</p>
                        </div>
                    )}
                </motion.div>

                {/* Members Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full"
                >
                    <DataTable
                        title="കുടുംബ അംഗങ്ങൾ (Family Members)"
                        subtitle={`View all members registered under ${house.house_code}`}
                        columns={memberColumns}
                        data={members}
                        loading={loading}
                        pagination={{
                            currentPage,
                            totalPages,
                            totalEntries,
                            itemsPerPage,
                            onPageChange: setCurrentPage,
                            onItemsPerPageChange: setItemsPerPage
                        }}
                        createButton={{
                            label: "പുതിയ അംഗം (Add)",
                            path: "/family/member/add"
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
