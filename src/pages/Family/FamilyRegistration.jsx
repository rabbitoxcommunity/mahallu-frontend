import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, Edit, Users, Eye } from 'lucide-react';
import axios from '../../api/axios';

export default function FamilyRegistration() {
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination & Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchFamilies = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/family', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                }
            });
            setFamilies(data.families || []);
            setTotalEntries(data.total || 0);
            setTotalPages(data.pages || 0);
        } catch (error) {
            // error is handled by global axios interceptor
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFamilies();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [currentPage, itemsPerPage, searchTerm]);

    // Handle Page Resets
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-[#0B65F6]" />
                        കുടുംബ വിവരങ്ങൾ (Families)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all registered families.</p>
                </div>
                <Link
                    to="/family/register/create" // matches App.jsx route
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#0B65F6] rounded-xl hover:bg-[#0B65F6] transition-colors shadow-sm shadow-[#0B65F6] dark:shadow-none"
                >
                    <Plus size={16} />
                    പുതിയ കുടുംബം (Add Family)
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-max">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-[#0B65F6] focus:border-[#0B65F6] block p-2 cursor-pointer outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-max">entries</span>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="കുടുംബം അന്വേഷിക്കുക (Search...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B65F6]"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#252731] dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-4 whitespace-nowrap">കോഡ് (Code)</th>
                                <th scope="col" className="px-6 py-4 whitespace-nowrap">കുടുംബത്തിന്റെ പേര് (Family Name)</th>
                                <th scope="col" className="px-6 py-4">കുറിപ്പുകൾ (Notes)</th>
                                <th scope="col" className="px-6 py-4 whitespace-nowrap">സ്റ്റാറ്റസ് (Status)</th>
                                <th scope="col" className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-[#0B65F6] border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <span className="text-xs font-medium text-gray-500">കുടുംബ വിവരങ്ങൾ ലോഡുചെയ്യുന്നു (Loading fields)...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : families.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <Search size={32} className="mb-3 opacity-20" />
                                            <span className="text-xs font-medium">വിവരങ്ങൾ ലഭ്യമല്ല (No families found)</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                families.map((family) => (
                                    <tr key={family._id} className="bg-white dark:bg-[#1e1f25] hover:bg-gray-50 dark:hover:bg-[#252731] border-b border-gray-50 dark:border-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            {family.family_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{family.family_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="truncate max-w-[200px] text-gray-500 dark:text-gray-400" title={family.notes}>
                                                {family.notes || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full ${
                                                family.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500' 
                                                    : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
                                            }`}>
                                                {family.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 dark:hover:bg-[#0B65F6]/10 rounded-lg transition-colors group">
                                                    <Eye size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 dark:hover:bg-[#0B65F6]/10 rounded-lg transition-colors group">
                                                    <Edit size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Details and Controls */}
                {!loading && families.length > 0 && (
                    <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalEntries)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalEntries}</span> Entries
                        </span>

                        <div className="inline-flex rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 bg-white dark:bg-[#1e1f25] hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-10 focus:ring-2 focus:ring-[#0B65F6] focus:text-[#0B65F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 bg-white dark:bg-[#1e1f25]">
                                                ...
                                            </span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 border-r border-gray-200 dark:border-gray-700 text-xs font-medium transition-colors ${
                                                currentPage === page
                                                    ? 'z-10 bg-[#0B65F6]/10 text-[#0B65F6] dark:bg-[#0B65F6]/10 dark:text-[#0B65F6]'
                                                    : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                            
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-xs font-medium text-gray-500 bg-white dark:bg-[#1e1f25] hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-10 focus:ring-2 focus:ring-[#0B65F6] focus:text-[#0B65F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
