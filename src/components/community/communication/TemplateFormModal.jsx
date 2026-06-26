import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, ChevronRight, ChevronLeft, Plus, Trash2,
    ArrowUp, ArrowDown, Pencil, Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { createTemplate, updateTemplate, getCommSettings } from '../../../api/communicationService';

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
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({
        ...base,
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
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


const INPUT_TYPE_OPTIONS = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'select', label: 'Select / Dropdown' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelToKey = (label) =>
    label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

const EMPTY_FIELD = {
    label: '',
    key: '',
    input_type: 'text',
    required: false,
    placeholder: '',
    default_value: '',
    options: [],
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ step, total, labels }) => (
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hide">
        {labels.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
                <React.Fragment key={idx}>
                    <div className={`flex items-center gap-2 flex-shrink-0 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${active ? 'bg-blue-600 border-blue-600 text-white' : done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
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

// ─── Field Editor (inline) ────────────────────────────────────────────────────

const FieldEditor = ({ field, onChange, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [local, setLocal] = useState({ ...field });
    const [optionsStr, setOptionsStr] = useState((field.options || []).join(', '));

    const set = (k, v) => {
        const updated = { ...local, [k]: v };
        if (k === 'label' && !field.key) updated.key = labelToKey(v);
        setLocal(updated);
    };

    const handleSave = () => {
        if (!local.label.trim()) { toast.error(t('comm.builder.fieldLabelRequired')); return; }
        if (!local.key.trim()) { toast.error(t('comm.builder.fieldKeyRequired')); return; }
        const opts = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
        onSave({ ...local, key: labelToKey(local.key) || local.key, options: opts });
    };

    return (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Label */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('comm.builder.fieldLabel')} *</label>
                    <input
                        value={local.label}
                        onChange={e => set('label', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Deceased Name"
                    />
                </div>
                {/* Key */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('comm.builder.fieldKey')} *</label>
                    <input
                        value={local.key}
                        onChange={e => set('key', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="e.g. deceased_name"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">{t('comm.builder.fieldKeyHint')}</p>
                </div>
                {/* Input Type */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('comm.builder.inputType')}</label>
                    <Select
                        value={INPUT_TYPE_OPTIONS.find(o => o.value === local.input_type) || null}
                        onChange={o => set('input_type', o?.value || 'text')}
                        options={INPUT_TYPE_OPTIONS}
                        styles={getSelectStyles()}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                {/* Placeholder */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('comm.builder.placeholder')}</label>
                    <input
                        value={local.placeholder}
                        onChange={e => set('placeholder', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional placeholder..."
                    />
                </div>
            </div>

            {/* Select options */}
            {local.input_type === 'select' && (
                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('comm.builder.selectOptions')}</label>
                    <input
                        value={optionsStr}
                        onChange={e => setOptionsStr(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Option A, Option B, Option C"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">{t('comm.builder.selectOptionsHint')}</p>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={local.required} onChange={e => set('required', e.target.checked)} className="rounded" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('comm.builder.required')}</span>
                </label>
                <div className="flex gap-2">
                    <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {t('common.cancel')}
                    </button>
                    <button type="button" onClick={handleSave} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                        <Check size={12} /> {t('comm.builder.saveField')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TemplateFormModal = ({ editRecord, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const isEdit = !!editRecord;
    const [step, setStep] = useState(1);
    const [fields, setFields] = useState([]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [addingNew, setAddingNew] = useState(false);
    const [moduleOptions, setModuleOptions] = useState([]);
    const textareaRef = useRef(null);

    useEffect(() => {
        getCommSettings()
            .then(d => {
                const types = ((d.settings || {}).announcement_types || []).map(t =>
                    typeof t === 'string' ? { name: t } : { _id: t._id, name: t.name || t.id || t }
                ).filter(t => t.name);
                setModuleOptions(types.map(t => ({ value: t._id || t.name, label: t.name })));
            })
            .catch(() => {});
    }, []);

    const STEP_LABELS = [t('comm.builder.step1'), t('comm.builder.step2'), t('comm.builder.step3')];

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { template_name: '', module: null, message: '' },
    });

    const message = watch('message');

    useEffect(() => {
        if (editRecord) {
            const storedModule = editRecord.module || '';
            const mod = storedModule
                ? (moduleOptions.find(o => o.value === storedModule) || { value: storedModule, label: storedModule })
                : null;
            reset({
                template_name: editRecord.template_name || '',
                module: mod,
                message: editRecord.message || '',
            });
            const sortedFields = [...(editRecord.dynamic_fields || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setFields(sortedFields);
        }
    }, [editRecord, moduleOptions, reset]);

    // ─── Field management ─────────────────────────────────────────────────────

    const saveNewField = (f) => {
        setFields(prev => [...prev, { ...f, order: prev.length }]);
        setAddingNew(false);
    };

    const saveEditedField = (f, idx) => {
        setFields(prev => prev.map((item, i) => i === idx ? { ...f, order: idx } : item));
        setEditingIdx(null);
    };

    const deleteField = (idx) => {
        setFields(prev => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, order: i })));
    };

    const moveField = (idx, dir) => {
        setFields(prev => {
            const next = [...prev];
            const target = idx + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[idx], next[target]] = [next[target], next[idx]];
            return next.map((f, i) => ({ ...f, order: i }));
        });
    };

    // ─── Message body / chip insert ───────────────────────────────────────────

    const insertChip = (key) => {
        const tag = `{{${key}}}`;
        const ta = textareaRef.current;
        if (!ta) { setValue('message', (message || '') + tag); return; }
        const s = ta.selectionStart;
        const e = ta.selectionEnd;
        const cur = message || '';
        setValue('message', cur.slice(0, s) + tag + cur.slice(e));
        setTimeout(() => { ta.focus(); ta.setSelectionRange(s + tag.length, s + tag.length); }, 0);
    };

    const previewBody = (message || '').replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const f = fields.find(fl => fl.key === key);
        return f ? `[${f.label}]` : `[${key}]`;
    });

    // ─── Navigation ──────────────────────────────────────────────────────────

    const goNext = handleSubmit(() => {
        setStep(s => Math.min(s + 1, 3));
    });

    const goPrev = () => {
        setEditingIdx(null);
        setAddingNew(false);
        setStep(s => Math.max(s - 1, 1));
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

    const onSubmit = async (values) => {
        if (!values.message?.trim()) { toast.error(t('comm.template.messageRequired')); return; }

        const payload = {
            template_name: values.template_name,
            module: values.module?.value || 'general',
            category: values.module?.label || 'General',
            message: values.message,
            dynamic_fields: fields,
        };

        try {
            if (isEdit) {
                await updateTemplate(editRecord._id, payload);
                toast.success(t('comm.template.updated'));
            } else {
                await createTemplate(payload);
                toast.success(t('comm.template.created'));
            }
            onSuccess();
        } catch { /* handled by interceptor */ }
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
                    className="bg-white dark:bg-[#1e1f25] rounded-3xl shadow-2xl w-full max-w-3xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEdit ? t('comm.template.editTitle') : t('comm.template.newTitle')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('comm.builder.subtitle')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator step={step} total={3} labels={STEP_LABELS} />

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.18 }}
                        >
                            {/* ── Step 1: Basic info ── */}
                            {step === 1 && (
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('comm.template.name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('template_name', { required: t('comm.template.nameRequired') })}
                                            placeholder={t('comm.template.namePlaceholder')}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.template_name && <p className="mt-1 text-xs text-red-500">{errors.template_name.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('comm.builder.module')} <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="module"
                                            control={control}
                                            rules={{ required: t('comm.builder.moduleRequired') }}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={moduleOptions}
                                                    placeholder={t('comm.builder.modulePlaceholder')}
                                                    styles={getSelectStyles()}
                                                    menuPortalTarget={document.body}
                                                    menuPosition="fixed"
                                                />
                                            )}
                                        />
                                        {errors.module && <p className="mt-1 text-xs text-red-500">{errors.module.message}</p>}
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4">
                                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                            {t('comm.builder.step1Hint')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Dynamic Fields ── */}
                            {step === 2 && (
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('comm.builder.fieldsDesc')}</p>
                                        <button
                                            type="button"
                                            onClick={() => { setAddingNew(true); setEditingIdx(null); }}
                                            disabled={addingNew}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                                        >
                                            <Plus size={13} /> {t('comm.builder.addField')}
                                        </button>
                                    </div>

                                    {/* Field list */}
                                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                        {fields.length === 0 && !addingNew && (
                                            <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                                                {t('comm.builder.noFields')}
                                            </div>
                                        )}

                                        {fields.map((f, idx) => (
                                            editingIdx === idx ? (
                                                <FieldEditor
                                                    key={idx}
                                                    field={f}
                                                    onSave={(updated) => saveEditedField(updated, idx)}
                                                    onCancel={() => setEditingIdx(null)}
                                                />
                                            ) : (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252731] rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <div className="flex flex-col gap-1">
                                                        <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"><ArrowUp size={12} /></button>
                                                        <button type="button" onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"><ArrowDown size={12} /></button>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{f.label}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{'{{' + f.key + '}}'} · {f.input_type}{f.required ? ' · required' : ''}</p>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        <button type="button" onClick={() => { setEditingIdx(idx); setAddingNew(false); }} className="p-1.5 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"><Pencil size={13} /></button>
                                                        <button type="button" onClick={() => deleteField(idx)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={13} /></button>
                                                    </div>
                                                </div>
                                            )
                                        ))}

                                        {addingNew && (
                                            <FieldEditor
                                                field={{ ...EMPTY_FIELD }}
                                                onSave={saveNewField}
                                                onCancel={() => setAddingNew(false)}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Message body ── */}
                            {step === 3 && (
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:divide-x divide-gray-100 dark:divide-gray-800">
                                    {/* Left: editor */}
                                    <div className="space-y-4">
                                        {/* Field chips */}
                                        {fields.length > 0 && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('comm.builder.availableFields')}</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {fields.map(f => (
                                                        <button
                                                            key={f.key}
                                                            type="button"
                                                            onClick={() => insertChip(f.key)}
                                                            className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                                                        >
                                                            {f.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Textarea */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                {t('comm.template.messageBody')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                ref={textareaRef}
                                                {...register('message', { required: t('comm.template.messageRequired') })}
                                                rows={10}
                                                placeholder={t('comm.builder.messagePlaceholder')}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
                                            />
                                            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                                        </div>
                                    </div>

                                    {/* Right: preview */}
                                    <div className="lg:pl-4 space-y-3">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('comm.builder.preview')}</label>
                                        <div className="bg-[#e5ddd5] dark:bg-[#0d1418] rounded-2xl p-4 min-h-40">
                                            {previewBody ? (
                                                <div className="relative max-w-xs">
                                                    <div className="absolute -left-2 top-3 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-[#dcf8c6] dark:border-r-[#005c4b] border-b-[8px] border-b-transparent" />
                                                    <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                                        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{previewBody}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-6">{t('comm.builder.previewEmpty')}</p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {t('comm.builder.previewHint')}
                                        </p>
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
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                            >
                                {t('common.next')}
                                <ChevronRight size={15} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                <Save size={15} />
                                {isEdit ? t('common.update') : t('common.save')}
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TemplateFormModal;
