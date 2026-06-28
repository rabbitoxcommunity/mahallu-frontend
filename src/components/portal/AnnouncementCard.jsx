import React from 'react';
import { Calendar, Tag, ChevronRight } from 'lucide-react';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const AnnouncementCard = ({ announcement, onClick }) => {
  const { title, category, body, published_at } = announcement;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug flex-1">{title}</h3>
        {category && (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Tag size={9} />{category}
          </span>
        )}
      </div>

      {body && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
          {body}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={11} />
          <span>{fmtDate(published_at)}</span>
        </div>
        <span className="flex items-center gap-0.5 text-[11px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Read more <ChevronRight size={12} />
        </span>
      </div>
    </button>
  );
};

export default AnnouncementCard;
