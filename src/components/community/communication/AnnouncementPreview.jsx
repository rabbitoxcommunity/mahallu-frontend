import React from 'react';
import { useTranslation } from 'react-i18next';

const TYPE_EMOJI = {
    'Death Notice': '🕌',
    'Marriage Notice': '💍',
    'Welfare': '🤝',
    'Meeting': '📋',
    'General': '📢',
    'Ramadan': '🌙',
    'Eid': '✨',
    'Emergency': '🚨',
    'Other': '📣',
};

const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const AnnouncementPreview = ({ type, title, body, announcementDate, organizationName, signature }) => {
    const { t } = useTranslation();

    const emoji = TYPE_EMOJI[type] || '📢';
    const orgName = organizationName || t('comm.preview.defaultOrg');
    const sig = signature || t('comm.preview.defaultSig');

    const hasContent = type || title || body;

    if (!hasContent) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                <span className="text-4xl mb-3">📱</span>
                <p className="text-sm">{t('comm.preview.empty')}</p>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            {/* WhatsApp bubble */}
            <div className="relative max-w-xs w-full">
                {/* Bubble tail */}
                <div className="absolute -left-2 top-3 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-[#dcf8c6] dark:border-r-[#005c4b] border-b-[8px] border-b-transparent" />

                <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm space-y-2">
                    {/* Header line */}
                    {(type || title) && (
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                                {emoji} {type || ''}{title ? ` — ${title}` : ''}
                            </p>
                        </div>
                    )}

                    {/* Salutation */}
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        {t('comm.preview.salutation')}
                    </p>

                    {/* Body */}
                    {body && (
                        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                            {body}
                        </p>
                    )}

                    {/* Date */}
                    {announcementDate && (
                        <div className="pt-1">
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                📅 {formatDate(announcementDate)}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-1 border-t border-green-200 dark:border-green-800 space-y-0.5">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            — {sig}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{orgName}</p>
                    </div>

                    {/* Timestamp */}
                    <p className="text-right text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementPreview;
