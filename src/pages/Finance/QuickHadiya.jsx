import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  Plus,
  X,
  Printer,
  Calendar,
  Filter,
  Edit2,
  Trash2,
  Wallet,
  Building2,
  User,
  Phone,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getHadiyaCollections,
  createHadiyaCollection,
  updateHadiyaCollection,
  deleteHadiyaCollection,
  getHadiyaSummary,
  searchHouses
} from '../../api/hadiyaService';

// Payment method badge
const PaymentMethodBadge = ({ method }) => {
  const styles = {
    cash: 'bg-green-100 text-green-700 border-green-200',
    upi: 'bg-blue-100 text-blue-700 border-blue-200',
    bank: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  const icons = {
    cash: Banknote,
    upi: Smartphone,
    bank: CreditCard
  };

  const Icon = icons[method] || Banknote;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[method] || styles.cash}`}>
      <Icon size={12} />
      <span className="capitalize">{method}</span>
    </span>
  );
};

// Contributor type badge
const ContributorTypeBadge = ({ type }) => {
  const styles = {
    house: 'bg-blue-100 text-blue-700 border-blue-200',
    external: 'bg-orange-100 text-orange-700 border-orange-200'
  };

  const icons = {
    house: Building2,
    external: User
  };

  const Icon = icons[type] || Building2;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[type] || styles.house}`}>
      <Icon size={12} />
      <span className="capitalize">{type === 'house' ? 'House' : 'External'}</span>
    </span>
  );
};

const QuickHadiya = ({ onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contributorTypeFilter, setContributorTypeFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [collectionsData, setCollectionsData] = useState({
    collections: [],
    total: 0,
    page: 1,
    pages: 1
  });

  // Modal states
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [viewModal, setViewModal] = useState({ isOpen: false, collection: null });
  const [editModal, setEditModal] = useState({ isOpen: false, collection: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, collection: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, collection: null });

  // Add form state
  const [addForm, setAddForm] = useState({
    contributor_type: 'house',
    house_id: '',
    contributor_name: '',
    contributor_place: '',
    contributor_mobile: '',
    amount: '',
    payment_method: 'cash',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    amount: '',
    payment_method: 'cash',
    notes: '',
    date: ''
  });

  // House search state
  const [houseSearchTerm, setHouseSearchTerm] = useState('');
  const [houseSearchResults, setHouseSearchResults] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [searchingHouses, setSearchingHouses] = useState(false);

  // Fetch collections
  const fetchCollections = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getHadiyaCollections({
        page,
        limit: 20,
        search: searchTerm,
        contributor_type: contributorTypeFilter,
        payment_method: paymentMethodFilter
      });
      setCollectionsData(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedFetchCollections = useCallback(
    debounce((page) => fetchCollections(page), 500),
    [searchTerm, contributorTypeFilter, paymentMethodFilter]
  );

  // House search with debounce
  const debouncedHouseSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setHouseSearchResults([]);
        return;
      }
      setSearchingHouses(true);
      try {
        const data = await searchHouses({ q: query, limit: 20 });
        setHouseSearchResults(data.results || []);
      } catch (error) {
        console.error('Error searching houses:', error);
      } finally {
        setSearchingHouses(false);
      }
    }, 300),
    []
  );

  // Debounce helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initial fetch
  useEffect(() => {
    fetchCollections();
  }, []);

  // Debounced search effect
  useEffect(() => {
    debouncedFetchCollections(1);
  }, [searchTerm, contributorTypeFilter, paymentMethodFilter]);

  // House search effect
  useEffect(() => {
    if (addForm.contributor_type === 'house') {
      debouncedHouseSearch(houseSearchTerm);
    }
  }, [houseSearchTerm, addForm.contributor_type]);

  // Handle create collection
  const handleCreate = async (printReceipt = false) => {
    try {
      const payload = {
        ...addForm,
        amount: Number(addForm.amount)
      };

      const response = await createHadiyaCollection(payload);
      toast.success('Hadiya collection created successfully');
      
      if (printReceipt) {
        setReceiptModal({ isOpen: true, collection: response.collection });
      }

      setAddModal({ isOpen: false });
      resetAddForm();
      fetchCollections();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error(error.response?.data?.message || 'Failed to create collection');
    }
  };

  // Handle update collection
  const handleUpdate = async () => {
    try {
      const payload = {
        ...editForm,
        amount: Number(editForm.amount)
      };

      await updateHadiyaCollection(editModal.collection._id, payload);
      toast.success('Collection updated successfully');
      setEditModal({ isOpen: false, collection: null });
      fetchCollections();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error(error.response?.data?.message || 'Failed to update collection');
    }
  };

  // Handle delete collection
  const handleDelete = async () => {
    try {
      await deleteHadiyaCollection(deleteModal.collection._id);
      toast.success('Collection deleted successfully');
      setDeleteModal({ isOpen: false, collection: null });
      fetchCollections();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error(error.response?.data?.message || 'Failed to delete collection');
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setAddForm({
      contributor_type: 'house',
      house_id: '',
      contributor_name: '',
      contributor_place: '',
      contributor_mobile: '',
      amount: '',
      payment_method: 'cash',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedHouse(null);
    setHouseSearchTerm('');
    setHouseSearchResults([]);
  };

  // Open edit modal
  const openEditModal = (collection) => {
    setEditModal({ isOpen: true, collection });
    setEditForm({
      amount: collection.amount.toString(),
      payment_method: collection.payment_method,
      notes: collection.notes || '',
      date: new Date(collection.date).toISOString().split('T')[0]
    });
  };

  return (
    <div className="w-full">
      {/* Main Content */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Filter Section */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                />
              </div>

              <select
                value={contributorTypeFilter}
                onChange={(e) => setContributorTypeFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              >
                <option value="">All Types</option>
                <option value="house">House</option>
                <option value="external">External</option>
              </select>

              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {(contributorTypeFilter || paymentMethodFilter) && (
                <button
                  onClick={() => {
                    setContributorTypeFilter('');
                    setPaymentMethodFilter('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                >
                  <X size={16} />
                  Clear
                </button>
              )}

              <button
                onClick={() => setAddModal({ isOpen: true })}
                className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                New Collection
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="text-[#0B65F6] animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Contributor</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectionsData.collections.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Wallet size={32} className="opacity-30" />
                            <p className="text-sm">No hadiya collections found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      collectionsData.collections.map((collection) => (
                        <tr key={collection._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{collection.collection_code}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(collection.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {collection.contributor_type === 'house' ? (
                              <div>
                                <p className="font-medium">{collection.house_id?.house_code}</p>
                                <p className="text-xs text-gray-500">{collection.house_id?.householder_name}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium">{collection.contributor_name}</p>
                                <p className="text-xs text-gray-500">{collection.contributor_place}</p>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <ContributorTypeBadge type={collection.contributor_type} />
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                            ₹{collection.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <PaymentMethodBadge method={collection.payment_method} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewModal({ isOpen: true, collection })}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(collection)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, collection })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button
                                onClick={() => setReceiptModal({ isOpen: true, collection })}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Receipt"
                              >
                                <Printer size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {collectionsData.collections.length === 0 ? (
                  <p className="py-12 text-center text-gray-500">No hadiya collections found.</p>
                ) : (
                  collectionsData.collections.map((collection) => (
                    <div key={collection._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{collection.collection_code}</p>
                          <p className="text-sm text-gray-500">{new Date(collection.date).toLocaleDateString()}</p>
                        </div>
                        <ContributorTypeBadge type={collection.contributor_type} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {collection.contributor_type === 'house' ? (
                            `${collection.house_id?.house_code} - ${collection.house_id?.householder_name}`
                          ) : (
                            collection.contributor_name
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">₹{collection.amount.toLocaleString()}</span>
                        <PaymentMethodBadge method={collection.payment_method} />
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setViewModal({ isOpen: true, collection })}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setReceiptModal({ isOpen: true, collection })}
                          className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {collectionsData.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((collectionsData.page - 1) * 20) + 1} to {Math.min(collectionsData.page * 20, collectionsData.total)} of {collectionsData.total} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchCollections(collectionsData.page - 1)}
                      disabled={collectionsData.page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {collectionsData.page} of {collectionsData.pages}
                    </span>
                    <button
                      onClick={() => fetchCollections(collectionsData.page + 1)}
                      disabled={collectionsData.page === collectionsData.pages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Collection Modal */}
      <AnimatePresence>
        {addModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Hadiya Collection</h2>
                  <button
                    onClick={() => {
                      setAddModal({ isOpen: false });
                      resetAddForm();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Contributor Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contributor Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contributor_type"
                        value="house"
                        checked={addForm.contributor_type === 'house'}
                        onChange={(e) => {
                          setAddForm({ ...addForm, contributor_type: e.target.value });
                          setSelectedHouse(null);
                          setHouseSearchTerm('');
                          setHouseSearchResults([]);
                        }}
                        className="w-4 h-4 text-[#0B65F6]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Registered House</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contributor_type"
                        value="external"
                        checked={addForm.contributor_type === 'external'}
                        onChange={(e) => setAddForm({ ...addForm, contributor_type: e.target.value })}
                        className="w-4 h-4 text-[#0B65F6]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">External / Guest</span>
                    </label>
                  </div>
                </div>

                {/* House Search (for registered house) */}
                {addForm.contributor_type === 'house' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search House
                    </label>
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search house name, person name, phone, area..."
                        value={houseSearchTerm}
                        onChange={(e) => setHouseSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      />
                      {searchingHouses && (
                        <RefreshCw size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                      )}
                    </div>

                    {/* House Search Results */}
                    {houseSearchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                        {houseSearchResults.map((house) => (
                          <div
                            key={house.house_id}
                            onClick={() => {
                              setSelectedHouse(house);
                              setAddForm({ ...addForm, house_id: house.house_id });
                              setHouseSearchTerm('');
                              setHouseSearchResults([]);
                            }}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                            <p className="font-medium text-gray-900 dark:text-white">{house.house_name}</p>
                            <p className="text-xs text-gray-500">{house.head_name} • {house.family_name}</p>
                            <p className="text-xs text-gray-400">{house.address} • {house.contact}</p>
                            <p className="text-xs text-gray-400">Code: {house.house_code}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected House */}
                    {selectedHouse && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedHouse.house_name}</p>
                        <p className="text-xs text-gray-500">{selectedHouse.head_name} • {selectedHouse.family_name}</p>
                        <p className="text-xs text-gray-400">{selectedHouse.address} • {selectedHouse.contact}</p>
                        <button
                          onClick={() => {
                            setSelectedHouse(null);
                            setAddForm({ ...addForm, house_id: '' });
                          }}
                          className="mt-2 text-xs text-red-600 hover:text-red-700"
                        >
                          Clear selection
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* External Contributor Fields */}
                {addForm.contributor_type === 'external' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contributor Name
                      </label>
                      <input
                        type="text"
                        value={addForm.contributor_name}
                        onChange={(e) => setAddForm({ ...addForm, contributor_name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Place / Address
                      </label>
                      <input
                        type="text"
                        value={addForm.contributor_place}
                        onChange={(e) => setAddForm({ ...addForm, contributor_place: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mobile
                      </label>
                      <input
                        type="text"
                        value={addForm.contributor_mobile}
                        onChange={(e) => setAddForm({ ...addForm, contributor_mobile: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={addForm.amount}
                      onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                      onWheel={(e) => e.target.blur()}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={addForm.payment_method}
                    onChange={(e) => setAddForm({ ...addForm, payment_method: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={addForm.notes}
                    onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => handleCreate(false)}
                  disabled={!addForm.amount || (addForm.contributor_type === 'house' && !addForm.house_id)}
                  className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Collection
                </button>
                <button
                  onClick={() => handleCreate(true)}
                  disabled={!addForm.amount || (addForm.contributor_type === 'house' && !addForm.house_id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.collection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Collection Details</h2>
                  <button
                    onClick={() => setViewModal({ isOpen: false, collection: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Code</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.collection.collection_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(viewModal.collection.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contributor</p>
                  {viewModal.collection.contributor_type === 'house' ? (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{viewModal.collection.house_id?.house_code}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viewModal.collection.house_id?.householder_name}</p>
                      <p className="text-sm text-gray-500">{viewModal.collection.house_id?.address}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{viewModal.collection.contributor_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viewModal.collection.contributor_place}</p>
                      <p className="text-sm text-gray-500">{viewModal.collection.contributor_mobile}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                    <ContributorTypeBadge type={viewModal.collection.contributor_type} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">₹{viewModal.collection.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                    <PaymentMethodBadge method={viewModal.collection.payment_method} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Collected By</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.collection.created_by?.name}</p>
                  </div>
                </div>

                {viewModal.collection.notes && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{viewModal.collection.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal.isOpen && editModal.collection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Collection</h2>
                  <button
                    onClick={() => setEditModal({ isOpen: false, collection: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      onWheel={(e) => e.target.blur()}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={editForm.payment_method}
                    onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setEditModal({ isOpen: false, collection: null })}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={!editForm.amount}
                  className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.collection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Collection?</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this hadiya collection? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, collection: null })}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptModal.isOpen && receiptModal.collection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Receipt</h2>
                  <button
                    onClick={() => setReceiptModal({ isOpen: false, collection: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Hadiya Receipt</p>
                  <p className="text-sm text-gray-500">Receipt No: {receiptModal.collection.receipt_no}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Collection Code</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{receiptModal.collection.collection_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(receiptModal.collection.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contributor</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {receiptModal.collection.contributor_type === 'house' 
                        ? receiptModal.collection.house_id?.householder_name 
                        : receiptModal.collection.contributor_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {receiptModal.collection.contributor_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">₹{receiptModal.collection.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Method</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {receiptModal.collection.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Collected By</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {receiptModal.collection.created_by?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    const receiptContent = `
                      <html>
                        <head>
                          <title>Receipt - ${receiptModal.collection.receipt_no}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                            .row { display: flex; justify-content: space-between; margin: 10px 0; }
                            .amount { font-size: 24px; font-weight: bold; color: green; text-align: center; margin: 20px 0; }
                          </style>
                        </head>
                        <body>
                          <div class="receipt">
                            <div class="header">
                              <h2>HADIYA RECEIPT</h2>
                              <p>Mahallu Management System</p>
                            </div>
                            <div class="row"><span>Receipt No:</span><strong>${receiptModal.collection.receipt_no}</strong></div>
                            <div class="row"><span>Collection Code:</span><strong>${receiptModal.collection.collection_code}</strong></div>
                            <div class="row"><span>Date:</span><strong>${new Date(receiptModal.collection.date).toLocaleDateString()}</strong></div>
                            <div class="row"><span>Contributor:</span><strong>${
                              receiptModal.collection.contributor_type === 'house'
                                ? receiptModal.collection.house_id?.house_code + ' - ' + receiptModal.collection.house_id?.householder_name
                                : receiptModal.collection.contributor_name
                            }</strong></div>
                            <div class="row"><span>Type:</span><strong>${receiptModal.collection.contributor_type === 'house' ? 'House' : 'External'}</strong></div>
                            <div class="amount">₹${receiptModal.collection.amount.toLocaleString()}</div>
                            <div class="row"><span>Method:</span><strong>${receiptModal.collection.payment_method?.toUpperCase()}</strong></div>
                            <div class="row"><span>Collected By:</span><strong>${receiptModal.collection.created_by?.name || 'Admin'}</strong></div>
                          </div>
                          <script>window.print();</script>
                        </body>
                      </html>
                    `;
                    printWindow.document.write(receiptContent);
                    printWindow.document.close();
                  }}
                  className="w-full px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Printer size={18} />
                    Print Receipt
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickHadiya;
