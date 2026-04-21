import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Calendar, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getIncomeCategories, createIncomeCategory, updateIncomeCategory, deleteIncomeCategory } from '../../api/incomeCategoryService';

const GeneralSettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [editModal, setEditModal] = useState({ isOpen: false, category: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });

  const [formData, setFormData] = useState({
    name: '',
    type: 'due',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getIncomeCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createIncomeCategory(formData);
      toast.success('Category created successfully');
      setAddModal({ isOpen: false });
      setFormData({ name: '', type: 'due', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateIncomeCategory(editModal.category._id, formData);
      toast.success('Category updated successfully');
      setEditModal({ isOpen: false, category: null });
      setFormData({ name: '', type: 'due', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncomeCategory(deleteModal.category._id);
      toast.success('Category deleted successfully');
      setDeleteModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const openEditModal = (category) => {
    setEditModal({
      isOpen: true,
      category
    });
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || ''
    });
  };

  const openDeleteModal = (category) => {
    setDeleteModal({
      isOpen: true,
      category
    });
  };

  const dueCategories = categories.filter(c => c.type === 'due');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Income Categories</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage income categories for Due and Income tracking</p>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setAddModal({ isOpen: true });
                setFormData({ name: '', type: 'due', description: '' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>

          <div className="space-y-8">
            {/* Due Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-[#0B65F6]" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Due Categories</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueCategories.map((category) => (
                  <div
                    key={category._id}
                    className="p-4 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#0B65F6] dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dueCategories.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                    No due categories found. Click "Add Category" to create one.
                  </div>
                )}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Income Categories</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category) => (
                  <div
                    key={category._id}
                    className="p-4 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#0B65F6] dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {incomeCategories.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                    No income categories found. Click "Add Category" to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal (Unified) */}
      <AnimatePresence>
        {(addModal.isOpen || (editModal.isOpen && editModal.category)) && (
          <>
            <motion.div
              key="add-edit-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setAddModal({ isOpen: false });
                setEditModal({ isOpen: false, category: null });
              }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="add-edit-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editModal.isOpen ? 'Edit Category' : 'Add Category'}
                    </h3>
                    <button
                      onClick={() => {
                        setAddModal({ isOpen: false });
                        setEditModal({ isOpen: false, category: null });
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <form onSubmit={editModal.isOpen ? handleUpdate : handleCreate} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      required
                    >
                      <option value="due">Due</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAddModal({ isOpen: false });
                        setEditModal({ isOpen: false, category: null });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#252731] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#2f3038] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      {editModal.isOpen ? 'Update' : 'Add'} Category
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.category && (
          <>
            <motion.div
              key="delete-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, category: null })}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="delete-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Category</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete "{deleteModal.category.name}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModal({ isOpen: false, category: null })}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#252731] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#2f3038] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeneralSettings;
