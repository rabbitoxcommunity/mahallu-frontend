import React from 'react';
import { Calendar, Tag, Paperclip } from 'lucide-react';

const AnnouncementCard = ({ announcement }) => {
  const { title, category, description, published_at, attachment_url } = announcement;

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug flex-1">{title}</h3>
        {category && (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Tag size={9} />{category}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
          {description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={11} />
          <span>{fmtDate(published_at)}</span>
        </div>
        {attachment_url && (
          <a href={attachment_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
            <Paperclip size={11} />Attachment
          </a>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;
