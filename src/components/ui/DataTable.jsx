import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
    title,
    subtitle,
    columns = [],
    data = [],
    loading = false,
    pagination = {
        currentPage: 1,
        totalPages: 0,
        totalEntries: 0,
        itemsPerPage: 10,
        onPageChange: () => {},
        onItemsPerPageChange: () => {}
    },
    search = {
        value: '',
        onChange: () => {},
        placeholder: 'Search...'
    },
    createButton
}) => {
    const { currentPage, totalPages, totalEntries, itemsPerPage, onPageChange, onItemsPerPageChange } = pagination;

    return (
        <div className="w-full">
            {/* Header Area */}
            {(title || createButton) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">{title}</h1>}
                        {subtitle && <p className=" text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
                    </div>
                    {createButton && (
                        <Link
                            to={createButton.path}
                            className="flex items-center justify-center gap-2 px-4 py-2.5  font-medium text-white bg-[#0B65F6] rounded-xl hover:bg-[#0B65F6]/90 transition-colors shadow-sm shadow-[#0B65F6]/20 dark:shadow-none"
                        >
                            <Plus size={16} />
                            {createButton.label}
                        </Link>
                    )}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className=" text-gray-500 dark:text-gray-400 min-w-max">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white  rounded-lg focus:ring-[#0B65F6] focus:border-[#0B65F6] block p-2 cursor-pointer outline-none"
                        >
                            {[10, 20, 50, 100].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                        <span className=" text-gray-500 dark:text-gray-400 min-w-max">entries</span>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={search.placeholder}
                            value={search.value}
                            onChange={(e) => search.onChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-700 rounded-xl  text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B65F6]"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full  text-left text-gray-500 dark:text-gray-400">
                        <thead className=" text-gray-700 uppercase bg-gray-50 dark:bg-[#252731] dark:text-gray-300">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        scope="col" 
                                        className={`px-6 py-4 whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-[#0B65F6] border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <span className=" font-medium text-gray-500">Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <Search size={32} className="mb-3 opacity-20" />
                                            <span className=" font-medium">No results found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr 
                                        key={row._id || rowIndex} 
                                        className="bg-white dark:bg-[#1e1f25] hover:bg-gray-50 dark:hover:bg-[#252731] border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td 
                                                key={colIdx} 
                                                className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''} ${col.cellClassName || ''}`}
                                            >
                                                {col.cell ? col.cell(row) : (row[col.accessor] || "-")}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && data.length > 0 && (
                    <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className=" text-gray-500 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-900 dark:text-white">
                                {totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                            </span> to <span className="font-semibold text-gray-900 dark:text-white">
                                {Math.min(currentPage * itemsPerPage, totalEntries)}
                            </span> of <span className="font-semibold text-gray-900 dark:text-white">
                                {totalEntries}
                            </span> Entries
                        </span>

                        <div className="inline-flex rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border-r border-gray-200 dark:border-gray-700  font-medium text-gray-500 bg-white dark:bg-[#1e1f25] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-4 py-2 border-r border-gray-200 dark:border-gray-700  font-medium text-gray-500 bg-white dark:bg-[#1e1f25]">
                                                ...
                                            </span>
                                        )}
                                        <button
                                            onClick={() => onPageChange(page)}
                                            className={`px-4 py-2 border-r border-gray-200 dark:border-gray-700  font-medium transition-colors ${
                                                currentPage === page
                                                    ? 'z-10 bg-[#0B65F6]/10 text-[#0B65F6] dark:text-[#0B65F6]'
                                                    : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                            
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-2  font-medium text-gray-500 bg-white dark:bg-[#1e1f25] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DataTable;
