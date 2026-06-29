import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Search, User } from 'lucide-react';
import PortalLayout from '../../../components/portal/PortalLayout';
import EmptyState from '../../../components/portal/EmptyState';
import { searchBloodDonors } from '../../../api/portalService';
import { motion, AnimatePresence } from 'framer-motion';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodDonorPage = () => {
  const { t }      = useTranslation();
  const [group,    setGroup]   = useState('');
  const [donors,   setDonors]  = useState(null);
  const [loading,  setLoading] = useState(false);

  const handleSearch = async () => {
    if (!group) return;
    setLoading(true);
    try {
      const res = await searchBloodDonors(group);
      setDonors(res.data.data || []);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-24 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative z-10"
        >
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Droplets size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            {t('portal.services.bloodDonor', {defaultValue: 'Blood Donor Directory'})}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
            {t('portal.bloodDonor.subtitle', {defaultValue: 'Search for available blood donors in your community.'})}
          </p>
        </motion.div>

        {/* Blood group picker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 sm:p-10 mb-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative z-10"
        >
          <label className="block text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-widest mb-6 text-center">
            {t('portal.bloodDonor.selectGroup', {defaultValue: 'Select Blood Group'})}
          </label>
          <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-8">
            {BLOOD_GROUPS.map(g => (
              <button key={g} onClick={() => setGroup(g)}
                className={`py-4 text-base font-bold rounded-2xl transition-all duration-300 border ${
                  group === g
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 shadow-inner'
                    : 'bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 border-white/40 dark:border-white/5'
                }`}>
                {g}
              </button>
            ))}
          </div>
          <button onClick={handleSearch} disabled={!group || loading}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5">
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Search size={18} />{t('portal.bloodDonor.search', {defaultValue: 'Search Donors'})}</>}
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {donors !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative z-10"
            >
              {donors.length === 0 ? (
                <EmptyState icon={Droplets} message={t('portal.bloodDonor.notFound', { group, defaultValue: `No donors found for group ${group}` })} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Results Found</h3>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                      {donors.length} {t('portal.bloodDonor.found', {defaultValue: 'Donors'})}
                    </span>
                  </div>
                  
                  {donors.map((d, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-[1.5rem] border border-white/40 dark:border-white/10 p-5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/60 dark:hover:bg-[#111]/60 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/10 flex items-center justify-center shadow-inner">
                          <User size={20} className="text-red-500" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-gray-900 dark:text-white block">{d.name}</span>
                          {d.phone && <span className="text-xs font-medium text-gray-500">{d.phone}</span>}
                        </div>
                      </div>
                      <span className="text-base font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{d.blood_group}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortalLayout>
  );
};

export default BloodDonorPage;
