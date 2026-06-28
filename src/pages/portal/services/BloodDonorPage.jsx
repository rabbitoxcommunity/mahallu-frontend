import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Search, User } from 'lucide-react';
import PortalLayout from '../../../components/portal/PortalLayout';
import EmptyState from '../../../components/portal/EmptyState';
import { searchBloodDonors } from '../../../api/portalService';

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
      <div className="max-w-xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Droplets size={26} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('portal.services.bloodDonor')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('portal.bloodDonor.subtitle')}</p>
        </div>

        {/* Blood group picker */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            {t('portal.bloodDonor.selectGroup')}
          </label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {BLOOD_GROUPS.map(g => (
              <button key={g} onClick={() => setGroup(g)}
                className={`py-2.5 text-sm font-bold rounded-xl border transition-all ${
                  group === g
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-600'
                }`}>
                {g}
              </button>
            ))}
          </div>
          <button onClick={handleSearch} disabled={!group || loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Search size={15} />{t('portal.bloodDonor.search')}</>}
          </button>
        </div>

        {/* Results */}
        {donors !== null && (
          donors.length === 0 ? (
            <EmptyState icon={Droplets} message={t('portal.bloodDonor.notFound', { group })} />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">{donors.length} {t('portal.bloodDonor.found')}</p>
              {donors.map((d, i) => (
                <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{d.blood_group}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </PortalLayout>
  );
};

export default BloodDonorPage;
