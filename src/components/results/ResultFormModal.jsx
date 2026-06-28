import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { X, ChevronRight, ChevronLeft, ClipboardList } from 'lucide-react';
import {
    getMadrasasForSelect, getClasses, getResultTypes, getSubjectsByClass, getAcademicYearsForSelect,
} from '../../api/resultService';

const ss = () => ({
    control: (b, s) => ({ ...b, backgroundColor: 'transparent', borderColor: s.isFocused ? '#0B65F6' : 'transparent', borderRadius: '0.75rem', boxShadow: s.isFocused ? '0 0 0 1px #0B65F6' : 'none', '&:hover': { borderColor: '#0B65F6' } }),
    menu: (b) => ({ ...b, borderRadius: '0.75rem', border: '1px solid #e5e7eb', zIndex: 9999 }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    option: (b, s) => ({ ...b, fontSize: '0.875rem', backgroundColor: s.isSelected ? '#0B65F6' : s.isFocused ? '#f3f4f6' : 'transparent', color: s.isSelected ? '#fff' : '#374151' }),
    placeholder: (b) => ({ ...b, color: '#9ca3af', fontSize: '0.875rem' }),
    singleValue: (b) => ({ ...b, color: 'inherit', fontSize: '0.875rem' }),
    input: (b) => ({ ...b, color: 'inherit' }),
});

const ic = (err) => `w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252731] border ${err ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`;
const lc = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const getGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    return 'F';
};

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
];

const ResultFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useTranslation();
    const isEdit = !!initialData;
    const [step, setStep] = useState(1);

    const [madrasaOptions, setMadrasaOptions] = useState([]);
    const [classOptions, setClassOptions] = useState([]);
    const [resultTypeOptions, setResultTypeOptions] = useState([]);
    const [academicYearOptions, setAcademicYearOptions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectMarks, setSubjectMarks] = useState([]);

    const [selectedMadrasa, setSelectedMadrasa] = useState(null);

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { madrasa_id: '', class_id: '', result_type_id: '', academic_year_id: '', student_name: '', teacher_remarks: '', principal_remarks: '', status: 'draft', public_visibility: false },
    });

    const watchedMadrasa = watch('madrasa_id');
    const watchedClass = watch('class_id');

    useEffect(() => {
        getMadrasasForSelect().then(d => setMadrasaOptions((d.madrasas || []).map(m => ({ value: m._id, label: m.name })))).catch(() => {});
        getResultTypes({ limit: 100 }).then(d => setResultTypeOptions((d.resultTypes || []).map(rt => ({ value: rt._id, label: rt.name })))).catch(() => {});
        getAcademicYearsForSelect().then(d => setAcademicYearOptions((d.academicYears || []).map(a => ({ value: a._id, label: a.name })))).catch(() => {});
    }, []);

    // Load classes when madrasa changes
    useEffect(() => {
        if (watchedMadrasa) {
            getClasses({ madrasa_id: watchedMadrasa, limit: 100 })
                .then(d => setClassOptions((d.classes || []).map(c => ({ value: c._id, label: c.name }))))
                .catch(() => {});
            setValue('class_id', '');
            setSubjects([]); setSubjectMarks([]);
        } else {
            setClassOptions([]); setSubjects([]); setSubjectMarks([]);
        }
    }, [watchedMadrasa, setValue]);

    // Load subjects when class changes
    useEffect(() => {
        if (watchedClass) {
            getSubjectsByClass(watchedClass)
                .then(d => {
                    const subs = d.subjects || [];
                    setSubjects(subs);
                    setSubjectMarks(subs.map(s => ({
                        subject_id: s._id,
                        subject_name: s.name,
                        max_marks: 100,
                        obtained_marks: '',
                        grade: '',
                        remarks: '',
                    })));
                })
                .catch(() => {});
        } else {
            setSubjects([]); setSubjectMarks([]);
        }
    }, [watchedClass]);

    useEffect(() => {
        if (!isOpen) return;
        setStep(1);
        if (isEdit) {
            const mid = initialData.madrasa_id?._id || initialData.madrasa_id;
            setSelectedMadrasa(mid || null);
            reset({
                madrasa_id: mid || '',
                class_id: initialData.class_id?._id || initialData.class_id || '',
                result_type_id: initialData.result_type_id?._id || initialData.result_type_id || '',
                academic_year_id: initialData.academic_year_id?._id || initialData.academic_year_id || '',
                student_name: initialData.student_name || initialData.member_id?.full_name || '',
                teacher_remarks: initialData.teacher_remarks || '',
                principal_remarks: initialData.principal_remarks || '',
                status: initialData.status || 'draft',
                public_visibility: initialData.public_visibility || false,
            });
            if (initialData.subjects?.length) {
                setSubjectMarks(initialData.subjects.map(s => ({
                    subject_id: s.subject_id?._id || s.subject_id,
                    subject_name: s.subject_name,
                    max_marks: s.max_marks || 100,
                    obtained_marks: s.obtained_marks || '',
                    grade: s.grade || '',
                    remarks: s.remarks || '',
                })));
            }
        } else {
            setSelectedMadrasa(null); setClassOptions([]); setSubjects([]); setSubjectMarks([]);
            reset({ madrasa_id: '', class_id: '', result_type_id: '', academic_year_id: '', student_name: '', teacher_remarks: '', principal_remarks: '', status: 'draft', public_visibility: false });
        }
    }, [isOpen, initialData, reset]);

    const updateMark = (idx, field, value) => {
        setSubjectMarks(prev => {
            const next = [...prev];
            let num = value === '' ? '' : Number(value);

            if (field === 'max_marks') {
                // max_marks must be ≥ 1
                if (num !== '' && num < 1) num = 1;
                next[idx] = { ...next[idx], max_marks: num };
                // re-clamp obtained if it now exceeds the new max
                const mx = Number(num) || 100;
                const obt = Number(next[idx].obtained_marks) || 0;
                if (obt > mx) next[idx].obtained_marks = mx;
            } else if (field === 'obtained_marks') {
                const mx = Number(next[idx].max_marks) || 100;
                if (num !== '' && num < 0) num = 0;
                if (num !== '' && num > mx) num = mx;
                next[idx] = { ...next[idx], obtained_marks: num };
            } else {
                next[idx] = { ...next[idx], [field]: value };
            }

            // recalculate grade
            const obt = Number(next[idx].obtained_marks) || 0;
            const mx  = Number(next[idx].max_marks) || 100;
            next[idx].grade = getGrade(mx > 0 ? (obt / mx) * 100 : 0);
            return next;
        });
    };

    const calcSummary = () => {
        const totalMax = subjectMarks.reduce((s, m) => s + (Number(m.max_marks) || 0), 0);
        const totalObt = subjectMarks.reduce((s, m) => s + (Number(m.obtained_marks) || 0), 0);
        const pct = totalMax > 0 ? Math.round((totalObt / totalMax) * 10000) / 100 : 0;
        return { totalMax, totalObt, pct, grade: getGrade(pct), isPass: pct >= 50 };
    };

    const summary = calcSummary();

    const validateStep1 = () => {
        const vals = watch(['madrasa_id', 'class_id', 'result_type_id', 'academic_year_id', 'student_name']);
        return vals[0] && vals[1] && vals[2] && vals[3] && vals[4];
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && subjectMarks.length === 0) return;
        setStep(s => Math.min(3, s + 1));
    };

    const doSubmit = async (formValues) => {
        await onSubmit({
            ...formValues,
            subjects: subjectMarks.map(m => ({ ...m, obtained_marks: Number(m.obtained_marks) || 0, max_marks: Number(m.max_marks) || 100 })),
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 py-8 overflow-y-auto"
                    onClick={onClose}>
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEdit ? t('results.form.edit') : t('results.form.create')}</h2>
                                    {isEdit && <p className="text-xs text-gray-500">{initialData.result_no}</p>}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X size={18} className="text-gray-500" /></button>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-0 px-6 pt-5">
                            {[
                                { n: 1, label: t('results.form.step1') },
                                { n: 2, label: t('results.form.step2') },
                                { n: 3, label: t('results.form.step3') },
                            ].map((s, i) => (
                                <React.Fragment key={s.n}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{s.n}</div>
                                        <span className={`text-xs mt-1 whitespace-nowrap ${step === s.n ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s.label}</span>
                                    </div>
                                    {i < 2 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${step > s.n ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit(doSubmit)}>
                            <div className="p-6 space-y-4">

                                {/* ── Step 1: Selection ── */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={lc}>{t('results.form.madrasa')} <span className="text-red-500">*</span></label>
                                                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <Controller name="madrasa_id" control={control} rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Select options={madrasaOptions} value={madrasaOptions.find(o => o.value === field.value) || null}
                                                                onChange={o => { field.onChange(o?.value || ''); setSelectedMadrasa(o?.value || null); }}
                                                                styles={ss()} placeholder={t('results.form.selectMadrasa')} menuPortalTarget={document.body} />
                                                        )} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={lc}>{t('results.form.class')} <span className="text-red-500">*</span></label>
                                                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <Controller name="class_id" control={control} rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Select options={classOptions} value={classOptions.find(o => o.value === field.value) || null}
                                                                onChange={o => field.onChange(o?.value || '')}
                                                                styles={ss()} placeholder={t('results.form.selectClass')} isDisabled={!watchedMadrasa} menuPortalTarget={document.body} />
                                                        )} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={lc}>{t('results.form.resultType')} <span className="text-red-500">*</span></label>
                                                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <Controller name="result_type_id" control={control} rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Select options={resultTypeOptions} value={resultTypeOptions.find(o => o.value === field.value) || null}
                                                                onChange={o => field.onChange(o?.value || '')}
                                                                styles={ss()} placeholder={t('results.form.selectResultType')} menuPortalTarget={document.body} />
                                                        )} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={lc}>{t('results.form.academicYear')} <span className="text-red-500">*</span></label>
                                                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <Controller name="academic_year_id" control={control} rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Select
                                                                options={academicYearOptions}
                                                                value={academicYearOptions.find(o => o.value === field.value) || null}
                                                                onChange={o => field.onChange(o?.value || '')}
                                                                styles={ss()}
                                                                placeholder={t('results.form.selectAcademicYear')}
                                                                noOptionsMessage={() => t('results.form.noAcademicYears')}
                                                                menuPortalTarget={document.body} />
                                                        )} />
                                                </div>
                                                {errors.academic_year_id && <p className="mt-1 text-xs text-red-500">{t('results.form.required')}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={lc}>{t('results.form.student')} <span className="text-red-500">*</span></label>
                                            <input
                                                {...register('student_name', { required: true })}
                                                placeholder={t('results.form.studentPlaceholder')}
                                                className={ic(errors.student_name)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 2: Subject Marks ── */}
                                {step === 2 && (
                                    <div>
                                        {subjectMarks.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                <p className="text-sm">{t('results.form.noSubjects')}</p>
                                                <p className="text-xs mt-1">{t('results.form.addSubjectsFirst')}</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 dark:border-gray-800">
                                                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('results.form.subject')}</th>
                                                            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-20">{t('results.form.maxMarks')}</th>
                                                            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-24">{t('results.form.obtained')}</th>
                                                            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-16">{t('results.form.grade')}</th>
                                                            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('results.form.remarks')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                                        {subjectMarks.map((sm, idx) => (
                                                            <tr key={sm.subject_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 [&>td]:pb-5">
                                                                <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{sm.subject_name}</td>
                                                                <td className="py-2 px-2">
                                                                    <input
                                                                        type="number" min="1" value={sm.max_marks}
                                                                        onChange={e => updateMark(idx, 'max_marks', e.target.value)}
                                                                        onKeyDown={e => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                                                                        className="w-full text-center px-2 py-1.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number" min="0" max={sm.max_marks}
                                                                            value={sm.obtained_marks}
                                                                            onChange={e => updateMark(idx, 'obtained_marks', e.target.value)}
                                                                            onKeyDown={e => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                                                                            className="w-full text-center px-2 py-1.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                                                                        />
                                                                        <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-gray-400">
                                                                            max {sm.max_marks}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 px-2 text-center">
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sm.grade === 'F' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                                        {sm.grade || '—'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input value={sm.remarks} onChange={e => updateMark(idx, 'remarks', e.target.value)}
                                                                        className="w-full px-2 py-1.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white" />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Step 3: Summary ── */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { label: t('results.form.totalMax'), value: summary.totalMax },
                                                { label: t('results.form.totalObtained'), value: summary.totalObt },
                                                { label: t('results.form.percentage'), value: `${summary.pct}%` },
                                                { label: t('results.form.grade'), value: summary.grade },
                                            ].map(stat => (
                                                <div key={stat.label} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={`text-center py-2 rounded-xl text-sm font-bold ${summary.isPass ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {summary.isPass ? t('results.form.pass') : t('results.form.fail')}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={lc}>{t('results.form.teacherRemarks')}</label>
                                                <textarea {...register('teacher_remarks')} rows={3} className={ic(false)} />
                                            </div>
                                            <div>
                                                <label className={lc}>{t('results.form.principalRemarks')}</label>
                                                <textarea {...register('principal_remarks')} rows={3} className={ic(false)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={lc}>{t('results.form.status')}</label>
                                                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <Controller name="status" control={control}
                                                        render={({ field }) => (
                                                            <Select options={STATUS_OPTIONS} value={STATUS_OPTIONS.find(o => o.value === field.value) || null}
                                                                onChange={o => field.onChange(o?.value || 'draft')} styles={ss()} />
                                                        )} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-6">
                                                <input type="checkbox" id="public_visibility" {...register('public_visibility')} className="w-4 h-4 rounded text-blue-600" />
                                                <label htmlFor="public_visibility" className="text-sm text-gray-700 dark:text-gray-300">{t('results.form.publicVisibility')}</label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-2">
                                <button type="button" onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <ChevronLeft size={16} />{step === 1 ? t('common.cancel') : t('common.back')}
                                </button>
                                {step < 3 ? (
                                    <button type="button" onClick={handleNext}
                                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                                        {t('common.next')}<ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                                        {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('common.loading')}</> : isEdit ? t('common.update') : t('results.form.save')}
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResultFormModal;
