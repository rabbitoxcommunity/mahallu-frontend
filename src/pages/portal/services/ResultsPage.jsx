import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, ChevronDown, ChevronUp, CheckCircle, XCircle, Search, X, Trophy } from 'lucide-react';
import PortalLayout from '../../../components/portal/PortalLayout';
import EmptyState from '../../../components/portal/EmptyState';
import LoadingSkeleton from '../../../components/portal/LoadingSkeleton';
import { fetchPublicResults } from '../../../api/portalService';
import { usePortal } from '../../../context/PortalContext';

const hl = (text, q) => {
  if (!q || !text) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-yellow-200 dark:bg-yellow-700/60 rounded px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
};

const ResultGroup = ({ group, highlight, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  // Find topper index (highest percentage among passing students, fallback to all)
  const topperIdx = useMemo(() => {
    const mapped = group.students.map((s, i) => ({ i, pct: s.percentage ?? 0, pass: s.is_pass }));
    const pool = mapped.filter(s => s.pass).length > 0 ? mapped.filter(s => s.pass) : mapped;
    if (!pool.length) return -1;
    return pool.reduce((best, cur) => cur.pct > best.pct ? cur : best, pool[0]).i;
  }, [group.students]);

  // Unique subjects in order
  const subjects = useMemo(() => {
    const seen = new Map();
    group.students.forEach(s =>
      (s.subjects || []).forEach(sub => {
        if (sub.subject_name && !seen.has(sub.subject_name))
          seen.set(sub.subject_name, sub.max_marks ?? 0);
      })
    );
    return Array.from(seen.entries()).map(([name, max]) => ({ name, max }));
  }, [group]);

  return (
    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

      {/* Group header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
              {group.result_type}
            </span>
            {group.academic_year && (
              <span className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {group.academic_year}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{group.class_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {group.students.length} student{group.students.length !== 1 ? 's' : ''}
            {subjects.length ? ` · ${subjects.length} subjects` : ''}
          </p>
          {topperIdx !== -1 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Trophy size={11} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {group.students[topperIdx]?.name}
              </span>
              <span className="text-xs text-gray-400">
                · {Number(group.students[topperIdx]?.percentage ?? 0).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {open
          ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>

      {/* Scrollable result table */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800 relative">
          {/* Fade hint — visible when table overflows */}
          {subjects.length >= 4 && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-20
              bg-gradient-to-l from-white dark:from-[#1e1f25] to-transparent" />
          )}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Subject names header */}
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                <th className="sticky left-0 z-10 bg-gray-50 dark:bg-[#1a1b21] px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap min-w-[44px]">
                  #
                </th>
                <th className="sticky left-[44px] z-10 bg-gray-50 dark:bg-[#1a1b21] px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap min-w-[160px] border-r border-gray-200 dark:border-gray-700">
                  Name
                </th>
                {subjects.map(sub => (
                  <th key={sub.name} className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap min-w-[80px]">
                    {sub.name}
                    {sub.max > 0 && (
                      <div className="text-[10px] font-normal text-gray-400">/{sub.max}</div>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap min-w-[80px] border-l border-gray-200 dark:border-gray-700">
                  Total
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap min-w-[60px]">%</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap min-w-[60px]">Grade</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap min-w-[70px]">Result</th>
              </tr>
            </thead>

            <tbody>
              {group.students.map((s, i) => {
                const smap = {};
                (s.subjects || []).forEach(sub => { if (sub.subject_name) smap[sub.subject_name] = sub; });
                const isTopper = i === topperIdx;
                const rowBg    = isTopper ? 'bg-amber-50 dark:bg-amber-900/10' : !s.is_pass ? 'bg-red-50/20 dark:bg-red-900/5' : '';
                const stickyBg = isTopper ? 'bg-amber-50 dark:bg-amber-900/10' : !s.is_pass ? 'bg-red-50 dark:bg-[#2a1a1a]' : 'bg-white dark:bg-[#1e1f25]';

                return (
                  <tr key={i} className={`border-t border-gray-50 dark:border-gray-800/50 ${rowBg}`}>
                    {/* Rank — sticky */}
                    <td className={`sticky left-0 z-10 px-4 py-3 font-medium text-center ${stickyBg}`}>
                      {isTopper
                        ? <Trophy size={14} className="text-amber-500 mx-auto" />
                        : <span className="text-gray-400">{i + 1}</span>}
                    </td>

                    {/* Name — sticky */}
                    <td className={`sticky left-[44px] z-10 px-4 py-3 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 ${stickyBg}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {hl(s.name, highlight)}
                        </span>
                        {isTopper && (
                          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            Topper
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Subject marks */}
                    {subjects.map(sub => {
                      const res = smap[sub.name];
                      const marks = res?.obtained_marks;
                      const isPoor = sub.max > 0 && marks != null && marks < sub.max * 0.4;
                      return (
                        <td key={sub.name} className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            isPoor
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {marks ?? '-'}
                          </span>
                          {res?.grade && (
                            <div className="text-[10px] text-gray-400 mt-0.5">{res.grade}</div>
                          )}
                        </td>
                      );
                    })}

                    {/* Total */}
                    <td className="px-4 py-3 text-center font-bold text-gray-800 dark:text-white border-l border-gray-100 dark:border-gray-800">
                      {s.total_marks ?? '-'}
                      {s.max_marks ? <span className="text-gray-400 font-normal">/{s.max_marks}</span> : ''}
                    </td>

                    {/* Percentage */}
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 font-medium">
                      {s.percentage != null ? `${Number(s.percentage).toFixed(1)}%` : '-'}
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-3 text-center">
                      {s.grade
                        ? <span className="inline-block font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-lg">
                            {s.grade}
                          </span>
                        : <span className="text-gray-400">-</span>}
                    </td>

                    {/* Result */}
                    <td className="px-4 py-3 text-center">
                      {s.is_pass
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400">
                            <CheckCircle size={12} />Pass
                          </span>
                        : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 dark:text-red-400">
                            <XCircle size={12} />Fail
                          </span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
};

const ResultsPage = () => {
  const { t }       = useTranslation();
  const { slug }    = usePortal();
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!slug) return;
    fetchPublicResults()
      .then(r => setData(r.data.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [slug]);

  const madrasas = useMemo(() => {
    const seen = new Set();
    const list = [];
    data.forEach(g => { if (!seen.has(g.madrasa)) { seen.add(g.madrasa); list.push(g.madrasa); } });
    return list;
  }, [data]);

  useEffect(() => {
    if (activeTab !== 'all' && !madrasas.includes(activeTab)) setActiveTab('all');
  }, [madrasas, activeTab]);

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    let groups = activeTab === 'all' ? data : data.filter(g => g.madrasa === activeTab);
    if (!q) return groups;
    return groups.map(group => {
      const groupMatch =
        group.class_name?.toLowerCase().includes(q) ||
        group.result_type?.toLowerCase().includes(q) ||
        group.academic_year?.toLowerCase().includes(q) ||
        group.madrasa?.toLowerCase().includes(q);
      const matchedStudents = group.students.filter(s => s.name?.toLowerCase().includes(q));
      if (groupMatch) return group;
      if (matchedStudents.length) return { ...group, students: matchedStudents };
      return null;
    }).filter(Boolean);
  }, [data, activeTab, q]);

  return (
    <PortalLayout>
      <div className="max-w-full px-4 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
              <GraduationCap size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('portal.services.results')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('portal.results.subtitle')}</p>
          </div>

          {loading ? (
            <div className="space-y-4"><LoadingSkeleton count={3} type="card" /></div>
          ) : data.length === 0 ? (
            <EmptyState icon={GraduationCap} message={t('portal.results.empty')} />
          ) : (
            <>
              {/* Madrasa tabs */}
              <div className="overflow-x-auto pb-1 mb-5 -mx-1 px-1">
                <div className="flex gap-2 min-w-max">
                  {[{ label: 'All Madrasas', value: 'all', count: data.length }, ...madrasas.map(m => ({ label: m, value: m, count: data.filter(g => g.madrasa === m).length }))].map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border ${
                        activeTab === tab.value
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-[#1e1f25] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:text-purple-600'
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}>{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-5">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by student name, class, exam type…"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e1f25] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={14} />
                  </button>
                )}
              </div>

              {q && (
                <p className="text-xs text-gray-400 mb-3">
                  {filtered.length === 0
                    ? `No results match "${search}"`
                    : `${filtered.reduce((n, g) => n + g.students.length, 0)} students in ${filtered.length} group${filtered.length !== 1 ? 's' : ''}`}
                </p>
              )}

              {filtered.length === 0 ? (
                <EmptyState icon={Search} message={`No results match "${search}"`} />
              ) : (
                <div className="space-y-4">
                  {filtered.map((group, i) => (
                    <ResultGroup
                      key={`${group.madrasa}-${group.class_name}-${group.result_type}-${i}`}
                      group={group}
                      highlight={q}
                      defaultOpen={!!q || filtered.length === 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default ResultsPage;
