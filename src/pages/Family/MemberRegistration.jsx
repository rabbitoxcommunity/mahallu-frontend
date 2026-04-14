import React, { useState, useEffect } from 'react';
import { Edit, Eye, User, Home, UserCheck } from 'lucide-react';
import axios from '../../api/axios';
import DataTable from '../../components/ui/DataTable';

export default function MemberRegistration() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/member/all', { // Assuming /member/all or similar exists for list
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                }
            });
            setMembers(data.members || []);
            setTotalEntries(data.total || 0);
            setTotalPages(data.pages || 0);
        } catch (error) {
            console.error("Error fetching members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchMembers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [currentPage, itemsPerPage, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const columns = [
        {
            header: "പേര് (Name)",
            accessor: "full_name",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B65F6]/10 flex items-center justify-center text-[#0B65F6]">
                        <User size={14} />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{row.full_name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{row.relation_to_head || "Member"}</div>
                    </div>
                </div>
            )
        },
        {
            header: "വീട്ടുടമ (Householder)",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{row.house_id?.householder_name || "N/A"}</span>
                    <span className="text-[10px] text-gray-500">{row.house_id?.house_code}</span>
                </div>
            )
        },
        {
            header: "ലിംഗം (Gender)",
            accessor: "gender",
            cellClassName: "text-gray-600 dark:text-gray-400"
        },
        {
            header: "വയസ്സ് (Age)",
            cell: (row) => {
                if (!row.dob) return "-";
                const age = new Date().getFullYear() - new Date(row.dob).getFullYear();
                return age;
            }
        },
        {
            header: "Head",
            cell: (row) => row.is_family_head ? (
                <span className="flex items-center gap-1 text-[#0B65F6] font-medium text-[11px]">
                    <UserCheck size={14} /> Head
                </span>
            ) : null
        },
        {
            header: "Actions",
            align: "right",
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 rounded-lg transition-colors">
                        <Eye size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 rounded-lg transition-colors">
                        <Edit size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DataTable
            title="അംഗങ്ങൾ (Members)"
            subtitle="Manage and view all registered members."
            columns={columns}
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
            search={{
                value: searchTerm,
                onChange: setSearchTerm,
                placeholder: "അംഗത്തെ തിരയുക (Search member...)"
            }}
            createButton={{
                label: "പുതിയ അംഗം (Add Member)",
                path: "/family/member/add"
            }}
        />
    );
}
