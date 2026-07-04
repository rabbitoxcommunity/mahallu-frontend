import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, X, Calendar, Wallet, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getIncomeCategories, createIncomeCategory, updateIncomeCategory, deleteIncomeCategory } from '../../api/incomeCategoryService';
import { getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../../api/expenseCategoryService';

const GeneralSettings = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState({ isOpen: false, categoryType: 'income' });
  const [editModal, setEditModal] = useState({ isOpen: false, category: null, categoryType: 'income' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null, categoryType: 'income' });

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

  const fetchExpenseCategories = async () => {
    setLoading(true);
    try {
      const data = await getExpenseCategories();
      setExpenseCategories(data);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      toast.error('Failed to fetch expense categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenseCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (addModal.categoryType === 'expense') {
        await createExpenseCategory(formData);
        toast.success('Expense category created successfully');
        fetchExpenseCategories();
      } else {
        await createIncomeCategory(formData);
        toast.success('Category created successfully');
        fetchCategories();
      }
      setAddModal({ isOpen: false, categoryType: 'income' });
      setFormData({ name: '', type: 'due', description: '' });
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editModal.categoryType === 'expense') {
        await updateExpenseCategory(editModal.category._id, formData);
        toast.success('Expense category updated successfully');
        fetchExpenseCategories();
      } else {
        await updateIncomeCategory(editModal.category._id, formData);
        toast.success('Category updated successfully');
        fetchCategories();
      }
      setEditModal({ isOpen: false, category: null, categoryType: 'income' });
      setFormData({ name: '', type: 'due', description: '' });
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteModal.categoryType === 'expense') {
        await deleteExpenseCategory(deleteModal.category._id);
        toast.success('Expense category deleted successfully');
        fetchExpenseCategories();
      } else {
        await deleteIncomeCategory(deleteModal.category._id);
        toast.success('Category deleted successfully');
        fetchCategories();
      }
      setDeleteModal({ isOpen: false, category: null, categoryType: 'income' });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const openEditModal = (category, categoryType = 'income') => {
    setEditModal({
      isOpen: true,
      category,
      categoryType
    });
    setFormData({
      name: category.name,
      type: category.type || '',
      description: category.description || ''
    });
  };

  const openDeleteModal = (category, categoryType = 'income') => {
    setDeleteModal({
      isOpen: true,
      category,
      categoryType
    });
  };

  const dueCategories = categories.filter(c => c.type === 'due');
  const incomeCategories = categories.filter(c => c.type === 'direct');
  const dueExpenseCategories = expenseCategories.filter(c => c.type === 'due');
  // Fall back to "direct" for any legacy category saved before the type field existed.
  const directExpenseCategories = expenseCategories.filter(c => c.type !== 'due');

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('finance.settings.categories.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('finance.settings.categories.description')}</p>
        </div>

        <div className="p-6">
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => {
                setAddModal({ isOpen: true, categoryType: 'income' });
                setFormData({ name: '', type: 'due', description: '' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              {t('finance.settings.categories.addIncomeCategory')}
            </button>
            <button
              onClick={() => {
                setAddModal({ isOpen: true, categoryType: 'expense' });
                setFormData({ name: '', type: 'direct', description: '' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              <Plus size={18} />
              {t('finance.settings.categories.addExpenseCategory')}
            </button>
          </div>

          <div className="space-y-8">
            {/* Due Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-[#0B65F6]" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('finance.settings.categories.dueCategories')}</h3>
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
                          <p className=" text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
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
                    {t('finance.settings.categories.noDueCategories')}
                  </div>
                )}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('finance.settings.categories.incomeCategories')}</h3>
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
                          <p className=" text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
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
                    {t('finance.settings.categories.noIncomeCategories')}
                  </div>
                )}
              </div>
            </div>

            {/* Due Based Expense Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('finance.settings.categories.dueExpenseCategories')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueExpenseCategories.map((category) => (
                  <div
                    key={category._id}
                    className="p-4 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        {category.description && (
                          <p className=" text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category, 'expense')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#0B65F6] dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category, 'expense')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dueExpenseCategories.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('finance.settings.categories.noDueExpenseCategories')}
                  </div>
                )}
              </div>
            </div>

            {/* Direct Expense Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('finance.settings.categories.directExpenseCategories')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {directExpenseCategories.map((category) => (
                  <div
                    key={category._id}
                    className="p-4 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        {category.description && (
                          <p className=" text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category, 'expense')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#0B65F6] dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category, 'expense')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {directExpenseCategories.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('finance.settings.categories.noDirectExpenseCategories')}
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
                      {addModal.categoryType === 'expense' || editModal.categoryType === 'expense'
                        ? (editModal.isOpen ? t('finance.settings.categories.editExpenseCategory') : t('finance.settings.categories.addExpenseCategory'))
                        : (editModal.isOpen ? t('finance.settings.categories.editCategory') : t('finance.settings.categories.addCategory'))
                      }
                    </h3>
                    <button
                      onClick={() => {
                        setAddModal({ isOpen: false, categoryType: 'income' });
                        setEditModal({ isOpen: false, category: null, categoryType: 'income' });
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <form onSubmit={editModal.isOpen ? handleUpdate : handleCreate} className="p-6 space-y-4">
                  {(() => {
                    const categoryContext = addModal.categoryType || editModal.categoryType;
                    if (categoryContext === 'income') {
                      return (
                        <div>
                          <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('finance.settings.categories.categoryType')} *
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl  focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                            required
                          >
                            <option value="due">{t('finance.income.due')}</option>
                            <option value="direct">{t('common.direct')}</option>
                          </select>
                        </div>
                      );
                    }
                    if (categoryContext === 'expense') {
                      return (
                        <div>
                          <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('finance.settings.categories.categoryType')} *
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl  focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                            required
                          >
                            <option value="due">{t('finance.income.due')}</option>
                            <option value="direct">{t('common.direct')}</option>
                          </select>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('finance.settings.categories.categoryName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl  focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('finance.settings.categories.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl  focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAddModal({ isOpen: false, categoryType: 'income' });
                        setEditModal({ isOpen: false, category: null, categoryType: 'income' });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#252731] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#2f3038] transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      {editModal.isOpen ? t('common.update') : t('common.add')} {t('finance.settings.categories.category')}
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('finance.settings.categories.deleteCategory')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('finance.settings.categories.deleteConfirmation')} "{deleteModal.category.name}"? {t('finance.settings.categories.deleteWarning')}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModal({ isOpen: false, category: null })}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#252731] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#2f3038] transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      {t('common.delete')}
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
