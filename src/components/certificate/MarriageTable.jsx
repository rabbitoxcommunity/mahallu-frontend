import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Download, Printer, Edit } from 'lucide-react';

const MarriageTable = ({ marriages, onView, onEdit, onDownload, onPrint }) => {
  const { t } = useTranslation();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('certificate.marriageId')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('certificate.groomName')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('certificate.brideName')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('certificate.marriageDate')}</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('certificate.certificateNo')}</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {marriages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  {t('certificate.noMarriages')}
                </td>
              </tr>
            ) : (
              marriages.map((marriage) => (
                <tr key={marriage._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    {marriage.marriage_id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {marriage.groom_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {marriage.bride_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(marriage.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {marriage.certificate_no}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(marriage._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('certificate.view')}
                      >
                        <Eye size={18} />
                      </button>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(marriage._id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title={t('certificate.edit')}
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => onDownload(marriage._id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={t('certificate.download')}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => onPrint(marriage._id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={t('certificate.print')}
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
  );
};

export default MarriageTable;
