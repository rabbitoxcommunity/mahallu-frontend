import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { X, ChevronRight, ChevronLeft, Send, Save, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTemplates, createAnnouncement, getCommSettings } from '../../../api/communicationService';
import AnnouncementPreview from './AnnouncementPreview';

// ─── Constants ────────────────────────────────────────────────────────────────

const getSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: state.isFocused ? '#0B65F6' : '#e5e7eb',
        borderRadius: '0.75rem',
        minHeight: '42px',
        boxShadow: state.isFocused ? '0 0 0 1px #0B65F6' : 'none',
        '&:hover': { borderColor: '#0B65F6' },
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        zIndex: 300,
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '0.875rem',
        backgroundColor: state.isSelected ? '#0B65F6' : state.isFocused ? '#f3f4f6' : 'transparent',
        color: state.isSelected ? '#fff' : '#374151',
        cursor: 'pointer',
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
    singleValue: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
    input: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
});


// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ step, total, labels }) => (
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hide">
        {labels.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
                <React.Fragment key={idx}>
                    <div className={`flex items-center gap-2 flex-shrink-0 ${active ? 'text-purple-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${active ? 'bg-purple-600 border-purple-600 text-white' : done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                            {done ? <Check size={12} /> : idx}
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">{label}</span>
                    </div>
                    {idx < total && <div className={`flex-1 min-w-4 h-px ${step > idx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Dynamic Field Renderer ───────────────────────────────────────────────────

const DynamicField = ({ field, value, onChange }) => {
    const inputClass = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";

    const options = (field.options || []).map(o => ({ value: o, label: o }));

    switch (field.input_type) {
        case 'textarea':
            return (
                <textarea
                    rows={3}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    className={`${inputClass} resize-none`}
                />
            );
        case 'select':
            return (
                <Select
                    value={value ? { value, label: value } : null}
                    onChange={o => onChange(o?.value || '')}
                    options={options}
                    placeholder={field.placeholder || 'Select...'}
                    styles={getSelectStyles()}
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            );
        case 'number':
            return <input type="number" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} className={inputClass} />;
        case 'date':
            return <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} />;
        case 'time':
            return <input type="time" value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} />;
        case 'datetime':
            return <input type="datetime-local" value={value || ''} onChange={e => onChange(e.target.value)} className={inputClass} />;
        case 'phone':
            return <input type="tel" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} className={inputClass} />;
        case 'email':
            return <input type="email" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} className={inputClass} />;
        default:
            return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} className={inputClass} />;
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ModuleAnnouncementModal = ({ onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState({});
    const [moduleOptions, setModuleOptions] = useState([]);

    // Step 1: module
    const [selectedModule, setSelectedModule] = useState(null);

    // Step 2: template
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Step 3: form values
    const [title, setTitle] = useState('');
    const [announcementDate, setAnnouncementDate] = useState('');
    const [fieldValues, setFieldValues] = useState({});

    const STEP_LABELS = [t('comm.moduleForm.step1'), t('comm.moduleForm.step2'), t('comm.moduleForm.step3')];

    useEffect(() => {
        getCommSettings().then(d => {
            const s = d.settings || {};
            setSettings(s);
            const types = s.announcement_types || [];
            setModuleOptions(types.map(t => ({ value: t, label: t })));
        }).catch(() => {});
    }, []);

    // Fetch all templates when module step is reached
    useEffect(() => {
        if (!selectedModule) return;
        setTemplatesLoading(true);
        setSelectedTemplate(null);
        getTemplates({ limit: 100 })
            .then(d => setTemplates(d.records || []))
            .catch(() => setTemplates([]))
            .finally(() => setTemplatesLoading(false));
    }, [selectedModule]);

    // Reset field values when template changes
    useEffect(() => {
        if (!selectedTemplate) return;
        const defaults = {};
        (selectedTemplate.dynamic_fields || []).forEach(f => {
            defaults[f.key] = f.default_value || '';
        });
        setFieldValues(defaults);
        if (!title && selectedTemplate.template_name) {
            setTitle(selectedTemplate.template_name);
        }
    }, [selectedTemplate]);

    const setFieldValue = useCallback((key, val) => {
        setFieldValues(prev => ({ ...prev, [key]: val }));
    }, []);

    // Build live preview body
    const builtBody = selectedTemplate?.message
        ? selectedTemplate.message.replace(/\{\{(\w+)\}\}/g, (_, key) => fieldValues[key] || `[${key}]`)
        : '';

    // ─── Navigation ──────────────────────────────────────────────────────────

    const goNext = () => {
        if (step === 1) {
            if (!selectedModule) { toast.error(t('comm.moduleForm.selectModule')); return; }
        }
        if (step === 2) {
            if (!selectedTemplate) { toast.error(t('comm.moduleForm.selectTemplate')); return; }
        }
        setStep(s => Math.min(s + 1, 3));
    };

    const goPrev = () => setStep(s => Math.max(s - 1, 1));

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async (publishImmediately = false) => {
        if (!title.trim()) { toast.error(t('comm.moduleForm.titleRequired')); return; }

        // Validate required dynamic fields
        const fields = selectedTemplate?.dynamic_fields || [];
        for (const f of fields) {
            if (f.required && !fieldValues[f.key]?.toString().trim()) {
                toast.error(`${f.label} is required`);
                return;
            }
        }

        setSubmitting(true);
        try {
            await createAnnouncement({
                title: title.trim(),
                body: builtBody,
                visibility: 'members_only',
                publish_immediately: publishImmediately,
                announcement_date: announcementDate || null,
                source: 'module',
                source_module: selectedModule?.value,
                template_id: selectedTemplate._id,
                field_values: fieldValues,
            });
            toast.success(publishImmediately ? t('comm.messages.published') : t('comm.messages.saved'));
            onSuccess();
        } catch { /* handled by interceptor */ }
        finally { setSubmitting(false); }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
            >
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-[#1e1f25] rounded-3xl shadow-2xl w-full max-w-4xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('comm.moduleForm.title')}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('comm.moduleForm.subtitle')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator step={step} total={3} labels={STEP_LABELS} />

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.18 }}
                        >
                            {/* ── Step 1: Select Module ── */}
                            {step === 1 && (
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('comm.moduleForm.moduleLabel')} <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={selectedModule}
                                            onChange={setSelectedModule}
                                            options={moduleOptions}
                                            placeholder={t('comm.moduleForm.modulePlaceholder')}
                                            styles={getSelectStyles()}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                        {moduleOptions.map(m => (
                                            <button
                                                key={m.value}
                                                type="button"
                                                onClick={() => setSelectedModule(m)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedModule?.value === m.value ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700'}`}
                                            >
                                                <p className={`text-sm font-semibold ${selectedModule?.value === m.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {m.label}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Select Template ── */}
                            {step === 2 && (
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {selectedModule?.label}
                                        </span>
                                    </div>

                                    {templatesLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
                                        </div>
                                    ) : templates.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                                            <p className="text-sm">{t('comm.moduleForm.noTemplates')}</p>
                                            <p className="text-xs mt-1">{t('comm.moduleForm.noTemplatesHint')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                            {templates.map(tpl => (
                                                <button
                                                    key={tpl._id}
                                                    type="button"
                                                    onClick={() => setSelectedTemplate(tpl)}
                                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedTemplate?._id === tpl._id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{tpl.template_name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{tpl.message}</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {(tpl.dynamic_fields || []).length > 0 && (
                                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                                                                    {(tpl.dynamic_fields || []).length} fields
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Step 3: Dynamic Form + Live Preview ── */}
                            {step === 3 && (
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:divide-x divide-gray-100 dark:divide-gray-800">
                                    {/* Left: form */}
                                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                        {/* Template info */}
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">{selectedModule?.label}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">→ {selectedTemplate?.template_name}</span>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                {t('comm.form.titleLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                placeholder={t('comm.form.titlePlaceholder')}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('comm.form.announcementDate')}</label>
                                            <input
                                                type="date"
                                                value={announcementDate}
                                                onChange={e => setAnnouncementDate(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        {/* Divider */}
                                        {(selectedTemplate?.dynamic_fields || []).length > 0 && (
                                            <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                                    {t('comm.moduleForm.templateFields')}
                                                </p>
                                                <div className="space-y-3">
                                                    {(selectedTemplate.dynamic_fields || [])
                                                        .slice()
                                                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                                        .map(f => (
                                                            <div key={f.key}>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    {f.label} {f.required && <span className="text-red-500">*</span>}
                                                                </label>
                                                                <DynamicField
                                                                    field={f}
                                                                    value={fieldValues[f.key] ?? ''}
                                                                    onChange={val => setFieldValue(f.key, val)}
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: live preview */}
                                    <div className="lg:pl-6 space-y-3">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('comm.preview.title')}</label>
                                        <div className="bg-[#e5ddd5] dark:bg-[#0d1418] rounded-2xl p-4 min-h-52">
                                            {builtBody || title ? (
                                                <AnnouncementPreview
                                                    type={selectedModule?.label || ''}
                                                    title={title}
                                                    body={builtBody}
                                                    announcementDate={announcementDate}
                                                    organizationName={settings.organization_name}
                                                    signature={settings.signature}
                                                />
                                            ) : (
                                                <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-8">{t('comm.preview.empty')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={step === 1 ? onClose : goPrev}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ChevronLeft size={15} />
                            {step === 1 ? t('common.cancel') : t('common.previous')}
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                            >
                                {t('common.next')} <ChevronRight size={15} />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit(false)}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    <Save size={15} /> {t('comm.actions.saveDraft')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmit(true)}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    <Send size={15} /> {t('comm.actions.publish')}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ModuleAnnouncementModal;
