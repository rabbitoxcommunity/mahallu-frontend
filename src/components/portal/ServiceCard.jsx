import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ServiceCard = ({ icon: Icon, title, description, to, disabled = false, color = 'blue' }) => {
  const { t } = useTranslation();

  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',     icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
  };
  const c = colors[color] || colors.blue;

  const inner = (
    <div className={`rounded-2xl p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1f25] h-full flex flex-col gap-4 ${!disabled ? 'hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all' : 'opacity-60'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${disabled ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
        {disabled ? <><Lock size={12} />{t('portal.comingSoon')}</> : <>{t('portal.openService')}<ArrowRight size={12} /></>}
      </div>
    </div>
  );

  if (disabled) return inner;
  return <Link to={to} className="block h-full">{inner}</Link>;
};

export default ServiceCard;
