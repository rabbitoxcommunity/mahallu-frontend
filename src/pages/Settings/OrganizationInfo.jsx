import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMyOrgInfo, updateMyOrgInfo } from '../../api/tenantService';

const OrganizationInfo = () => {
  const [orgInfo, setOrgInfo] = useState({ nameMalayalam: '', addressMalayalam: '', regNo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMyOrgInfo();
        setOrgInfo({
          nameMalayalam: data.tenant.nameMalayalam || '',
          addressMalayalam: data.tenant.addressMalayalam || '',
          regNo: data.tenant.regNo || '',
        });
      } catch (error) {
        console.error('Error fetching org info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyOrgInfo(orgInfo);
      toast.success('Organization info updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update organization info');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-[#0B65F6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Building2 size={22} className="text-[#0B65F6]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Info</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            This information appears in the header of PDF certificates (Nikah Register, General Certificate, etc.).
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name (Malayalam)
              </label>
              <input
                type="text"
                value={orgInfo.nameMalayalam}
                onChange={(e) => setOrgInfo({ ...orgInfo, nameMalayalam: e.target.value })}
                placeholder="e.g. എടക്കുളം സുന്നി മഹല്ല്"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6] text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used as the organization name in PDF headers (Malayalam script)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address (Malayalam)
              </label>
              <input
                type="text"
                value={orgInfo.addressMalayalam}
                onChange={(e) => setOrgInfo({ ...orgInfo, addressMalayalam: e.target.value })}
                placeholder="e.g. എടക്കുളം, മലപ്പുറം"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6] text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Address shown below the organization name in PDF headers
              </p>
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registration No.
              </label>
              <input
                type="text"
                value={orgInfo.regNo}
                onChange={(e) => setOrgInfo({ ...orgInfo, regNo: e.target.value })}
                placeholder="e.g. MLP/123/2020"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6] text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Official registration number shown in PDF headers
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 font-medium"
            >
              {saving ? 'Saving...' : 'Save Organization Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationInfo;
