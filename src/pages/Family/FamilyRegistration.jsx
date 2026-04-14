import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import axios from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import SlideOver from '../../components/ui/SlideOver';
import FamilyForm from './FamilyForm';

export default function FamilyRegistration() {
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState(null);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const handleEdit = (family) => {
        setSelectedFamily(family);
        setIsEditOpen(true);
    };

    const columns = [
        {
            header: "കോഡ് (Code)",
            accessor: "family_code",
            cellClassName: "font-semibold text-gray-900 dark:text-white whitespace-nowrap"
        },
        {
            header: "കുടുംബത്തിന്റെ പേര് (Family Name)",
            accessor: "family_name",
            cellClassName: "font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap"
        },
        {
            header: "കുറിപ്പുകൾ (Notes)",
            cell: (row) => (
                <div className="truncate max-w-[200px] text-gray-500 dark:text-gray-400" title={row.notes}>
                    {row.notes || "-"}
                </div>
            )
        },
        {
            header: "സ്റ്റാറ്റസ് (Status)",
            cell: (row) => (
                <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full ${row.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
                    : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
                    }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: "Actions",
            align: "right",
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => handleEdit(row)}
                        className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 dark:hover:bg-[#0B65F6]/10 rounded-lg transition-colors group"
                    >
                        <Edit size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <DataTable
                title="കുടുംബ വിവരങ്ങൾ (Families)"
                subtitle="Manage and view all registered families."
                columns={columns}
                data={families}
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
                    placeholder: "കുടുംബം അന്വേഷിക്കുക (Search...)"
                }}
                createButton={{
                    label: "പുതിയ കുടുംബം (Add Family)",
                    path: "/family/register/create"
                }}
            />

            <SlideOver
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="കുടുംബ വിവരങ്ങൾ മാറ്റുക (Edit Family)"
                subtitle={`Editing details for ${selectedFamily?.family_name}`}
            >
                <FamilyForm 
                    initialData={selectedFamily} 
                    onSuccess={() => {
                        setIsEditOpen(false);
                        fetchFamilies();
                    }}
                    onCancel={() => setIsEditOpen(false)}
                />
            </SlideOver>
        </>
    );
}
