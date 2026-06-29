import React from 'react';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const AnnouncementCard = ({ announcement, onClick }) => {
  const { title, category, body, published_at } = announcement;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2rem] border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 hover:bg-white/60 dark:hover:bg-[#111]/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-500 ease-out group relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-snug flex-1 tracking-tight">{title}</h3>
          {category && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-gray-300 flex-shrink-0 shadow-sm">
              <Tag size={10} />{category}
            </span>
          )}
        </div>

        {body && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 font-medium">
            {body}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <Calendar size={12} />
            <span>{fmtDate(published_at)}</span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-extrabold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Read more <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
};

export default AnnouncementCard;
