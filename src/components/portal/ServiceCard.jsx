import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ServiceCard = ({ icon: Icon, title, description, to, disabled = false, color = 'blue' }) => {
  const { t } = useTranslation();

  const colors = {
    blue:   { bg: 'bg-blue-50/50 dark:bg-blue-900/10',   icon: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    green:  { bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', icon: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
    red:    { bg: 'bg-rose-50/50 dark:bg-rose-900/10',     icon: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' },
    purple: { bg: 'bg-purple-50/50 dark:bg-purple-900/10', icon: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  };
  const c = colors[color] || colors.blue;

  const inner = (
    <div className={`rounded-[2rem] p-6 sm:p-8 border border-white/40 dark:border-white/10 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-full flex flex-col gap-5 relative overflow-hidden group ${
      !disabled 
        ? 'hover:bg-white/60 dark:hover:bg-[#111]/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-500 ease-out' 
        : 'opacity-50 cursor-not-allowed'
    }`}>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.icon} shadow-inner`}>
        <Icon size={26} strokeWidth={1.5} />
      </div>
      
      <div className="flex-1">
        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      
      <div className={`flex items-center gap-2 text-sm font-bold ${
        disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white group-hover:gap-3 transition-all duration-300'
      }`}>
        {disabled ? (
          <><Lock size={14} />{t('portal.comingSoon')}</>
        ) : (
          <>{t('portal.openService')} <ArrowRight size={14} /></>
        )}
      </div>
    </div>
  );

  if (disabled) return inner;
  return <Link to={to} className="block h-full">{inner}</Link>;
};

export default ServiceCard;
