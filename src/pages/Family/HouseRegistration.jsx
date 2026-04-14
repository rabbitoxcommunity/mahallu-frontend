import React, { useState, useEffect } from 'react';
import { Edit, Eye, User } from 'lucide-react';
import axios from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import SlideOver from '../../components/ui/SlideOver';
import HouseForm from './HouseForm';

export default function HouseRegistration() {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState(null);

    const fetchHouses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/house', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                }
            });
            setHouses(data.houses || []);
            setTotalEntries(data.total || 0);
            setTotalPages(data.pages || 0);
        } catch (error) {
            console.error("Error fetching houses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchHouses();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [currentPage, itemsPerPage, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const handleEdit = (house) => {
        setSelectedHouse(house);
        setIsEditOpen(true);
    };

    const columns = [
        {
            header: "കോഡ് (Code)",
            accessor: "house_code",
            cellClassName: "font-semibold text-gray-900 dark:text-white whitespace-nowrap"
        },
        {
            header: "വീട്ടുടമയുടെ പേര് (Householder Name)",
            accessor: "householder_name",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0B65F6]/10 flex items-center justify-center text-[#0B65F6]">
                        <User size={14} />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{row.householder_name}</span>
                </div>
            )
        },
        {
            header: "കുടുംബം (Family)",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 dark:text-gray-200 whitespace-nowrap">{row.family_id?.family_name || "-"}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{row.family_id?.family_code}</span>
                </div>
            )
        },
        {
            header: "സാമ്പത്തിക നില (Status)",
            cell: (row) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.economic_status === 'Poor' ? 'bg-red-100 text-red-700' :
                    row.economic_status === 'Miskeen' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {row.economic_status}
                </span>
            )
        },
        {
            header: "Actions",
            align: "right",
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 rounded-lg transition-colors">
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-gray-400 hover:text-[#0B65F6] hover:bg-[#0B65F6]/10 rounded-lg transition-colors group"
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
                title="വീട് വിവരങ്ങൾ (Houses)"
                subtitle="Manage and view all registered houses."
                columns={columns}
                data={houses}
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
                    placeholder: "വീട് തിരയുക (Search house...)"
                }}
                createButton={{
                    label: "പുതിയ വീട് (Add House)",
                    path: "/family/house/add"
                }}
            />

            <SlideOver
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="വീട് വിവരങ്ങൾ മാറ്റുക (Edit House)"
                subtitle={`Editing details for ${selectedHouse?.householder_name}`}
                width="max-w-3xl"
            >
                <HouseForm
                    initialData={selectedHouse}
                    onSuccess={() => {
                        setIsEditOpen(false);
                        fetchHouses();
                    }}
                    onCancel={() => setIsEditOpen(false)}
                />
            </SlideOver>
        </>
    );
}
