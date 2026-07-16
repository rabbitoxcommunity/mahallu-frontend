import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Download, Printer, Edit } from 'lucide-react';

const MarriageNocTable = ({ nocs, onView, onEdit, onDownload, onPrint }) => {
  const { t } = useTranslation();

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('noc.nocNumber')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('noc.groomName')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('noc.brideName')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('noc.date')}</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {nocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    {t('noc.noNocs')}
                  </td>
                </tr>
              ) : (
                nocs.map((noc) => (
                  <tr key={noc._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {noc.noc_number}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {noc.groom_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {noc.bride_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(noc.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onView(noc._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('noc.view')}
                        >
                          <Eye size={18} />
                        </button>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(noc._id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title={t('noc.edit')}
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => onDownload(noc._id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={t('noc.download')}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => onPrint(noc._id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title={t('noc.print')}
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {nocs.length === 0 ? (
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-gray-500 text-sm">
            {t('noc.noNocs')}
          </div>
        ) : (
          nocs.map((noc) => (
            <div key={noc._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{noc.noc_number}</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{noc.groom_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{noc.bride_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(noc.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => onView(noc._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors"
                >
                  <Eye size={12} /> {t('noc.view')}
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(noc._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors"
                  >
                    <Edit size={12} /> {t('noc.edit')}
                  </button>
                )}
                <button
                  onClick={() => onDownload(noc._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl transition-colors"
                >
                  <Download size={12} /> {t('noc.download')}
                </button>
                <button
                  onClick={() => onPrint(noc._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors"
                >
                  <Printer size={12} /> {t('noc.print')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarriageNocTable;
