import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Compass, BookOpen, Moon, MapPin, RefreshCw,
  FileText, ChevronRight, Tag, X
} from 'lucide-react';
import PortalLayout from '../../../components/portal/PortalLayout';
import { usePortal } from '../../../context/PortalContext';
import { getPublicSurahs, getPublicDuas, getPdfUrl } from '../../../api/islamicLibraryService';
import {
  calcPrayerTimes, calcQiblaDirection, getCurrentAndNextPrayer
} from '../../../utils/prayerTimesUtil';

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRAYER_NAMES = {
  fajr:    { en: 'Fajr',    ml: 'ഫജ്ർ',    icon: '🌙' },
  sunrise: { en: 'Sunrise', ml: 'സൂര്യോദയം', icon: '🌅' },
  dhuhr:   { en: 'Dhuhr',   ml: 'ദുഹ്ർ',   icon: '☀️' },
  asr:     { en: 'Asr',     ml: 'അസ്ർ',    icon: '🌤️' },
  maghrib: { en: 'Maghrib', ml: 'മഗ്രിബ്', icon: '🌇' },
  isha:    { en: 'Isha',    ml: 'ഇശ',      icon: '🌌' },
};

const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ── Section Header ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, titleEn, titleMl, color, lang }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
      {lang === 'ml' ? titleMl : titleEn}
    </h2>
  </div>
);

// ── Prayer Times ──────────────────────────────────────────────────────────────

const PrayerTimesSection = ({ prayerLocation, lang }) => {
  const [times,   setTimes]   = useState(null);
  const [current, setCurrent] = useState({ current: null, next: null });
  const [today,   setToday]   = useState('');

  useEffect(() => {
    const { latitude, longitude, method } = prayerLocation || {};
    try {
      const now = new Date();
      const t   = calcPrayerTimes(latitude, longitude, now, method || 'MWL');
      setTimes(t);
      setCurrent(getCurrentAndNextPrayer(t));
      setToday(now.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }));
    } catch { /* silent */ }
  }, [prayerLocation, lang]);

  if (!times) {
    return <div className="flex justify-center py-8"><RefreshCw size={24} className="animate-spin text-emerald-500" /></div>;
  }

  return (
    <div>
      {today && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{today}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PRAYER_ORDER.map((key) => {
          const info    = PRAYER_NAMES[key];
          const isNext  = current.next === key;
          const isCurr  = current.current === key;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-4 rounded-2xl border transition-all ${
                isNext
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 shadow-md'
                  : isCurr
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-[#1e1f25] border-gray-100 dark:border-gray-800'
              }`}
            >
              {isNext && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                  {lang === 'ml' ? 'അടുത്തത്' : 'Next'}
                </span>
              )}
              <div className="text-2xl mb-1">{info.icon}</div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {lang === 'ml' ? info.ml : info.en}
              </p>
              <p className={`text-base font-extrabold mt-0.5 ${isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
                {times[key]?.display || '--:--'}
              </p>
            </motion.div>
          );
        })}
      </div>
      {prayerLocation?.city && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={12} />
          {prayerLocation.city}
        </div>
      )}
    </div>
  );
};

// ── Qibla Compass ─────────────────────────────────────────────────────────────

const QiblaSection = ({ prayerLocation, lang }) => {
  const [bearing,  setBearing]  = useState(null);
  const [heading,  setHeading]  = useState(null);
  const [permErr,  setPermErr]  = useState('');
  const [started,  setStarted]  = useState(false);
  const listenerRef = useRef(null);

  const qiblaAngle = calcQiblaDirection(prayerLocation.latitude, prayerLocation.longitude);

  const startCompass = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermErr(lang === 'ml' ? 'ഈ ഉപകരണം കോമ്പസ് പിന്തുണ നൽകുന്നില്ല' : 'Compass not supported on this device');
      return;
    }
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          setPermErr(lang === 'ml' ? 'കോമ്പസ് അനുമതി നിരസിച്ചു' : 'Compass permission denied');
          return;
        }
      } catch {
        setPermErr(lang === 'ml' ? 'കോമ്പസ് ആക്സസ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Could not access compass');
        return;
      }
    }
    listenerRef.current = (e) => {
      const alpha = e.webkitCompassHeading ?? e.alpha;
      if (alpha !== null && alpha !== undefined) {
        setHeading(alpha);
        setBearing((qiblaAngle - alpha + 360) % 360);
      }
    };
    window.addEventListener('deviceorientation', listenerRef.current, true);
    setStarted(true);
  }, [qiblaAngle, lang]);

  useEffect(() => {
    return () => {
      if (listenerRef.current) window.removeEventListener('deviceorientation', listenerRef.current, true);
    };
  }, []);

  // Needle points to Qibla: if compass active use live bearing, else show static qibla angle
  const needleAngle = bearing !== null ? bearing : qiblaAngle;
  const isLive = started && bearing !== null;

  // SVG compass tick marks
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;
    const isMajor = angle % 90 === 0;
    const isMid   = angle % 45 === 0 && !isMajor;
    const r1 = 88;
    const r2 = isMajor ? 72 : isMid ? 76 : 80;
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x1: 96 + r1 * Math.cos(rad), y1: 96 + r1 * Math.sin(rad),
      x2: 96 + r2 * Math.cos(rad), y2: 96 + r2 * Math.sin(rad),
      isMajor, isMid,
    };
  });

  const cardinals = [
    { label: lang === 'ml' ? 'വ' : 'N', angle: 0  },
    { label: lang === 'ml' ? 'കി' : 'E', angle: 90 },
    { label: lang === 'ml' ? 'തെ' : 'S', angle: 180 },
    { label: lang === 'ml' ? 'പ' : 'W', angle: 270 },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Compass SVG */}
      <div className="relative">
        <svg width="192" height="192" viewBox="0 0 192 192">
          {/* Outer glow ring */}
          <circle cx="96" cy="96" r="92" fill="none"
            stroke="url(#compassGrad)" strokeWidth="2" opacity="0.4" />

          {/* Background circle */}
          <circle cx="96" cy="96" r="90"
            className="fill-white dark:fill-[#1e1f25]"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.12))' }} />

          {/* Inner dial ring */}
          <circle cx="96" cy="96" r="88" fill="none"
            className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              strokeWidth={t.isMajor ? 2 : t.isMid ? 1.5 : 1}
              className={t.isMajor
                ? 'stroke-gray-500 dark:stroke-gray-400'
                : 'stroke-gray-300 dark:stroke-gray-700'} />
          ))}

          {/* Cardinal labels */}
          {cardinals.map(({ label, angle }) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const r   = 62;
            return (
              <text key={angle}
                x={96 + r * Math.cos(rad)} y={96 + r * Math.sin(rad)}
                textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontWeight="700"
                className={`fill-gray-500 dark:fill-gray-400 ${angle === 0 ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`}>
                {label}
              </text>
            );
          })}

          {/* Gradient def */}
          <defs>
            <linearGradient id="compassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Needle group — rotates to Qibla */}
          <g transform={`rotate(${needleAngle}, 96, 96)`}
            style={{ transition: isLive ? 'transform 0.15s ease-out' : 'transform 0.6s ease-out' }}>
            {/* Qibla (green) half — points to Makkah */}
            <polygon points="96,20 100,96 92,96"
              fill="url(#needleGrad)" opacity="0.95" />
            {/* South (gray) half */}
            <polygon points="96,172 100,96 92,96"
              className="fill-gray-300 dark:fill-gray-600" opacity="0.7" />
            {/* Center dot */}
            <circle cx="96" cy="96" r="5" fill="white"
              stroke="#10b981" strokeWidth="2" />
          </g>

          {/* Kaaba emoji at tip direction */}
          <g transform={`rotate(${needleAngle}, 96, 96)`}
            style={{ transition: isLive ? 'transform 0.15s ease-out' : 'transform 0.6s ease-out' }}>
            <text x="96" y="13" textAnchor="middle" fontSize="12">🕋</text>
          </g>
        </svg>

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-1 left-1 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Degree display */}
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {Math.round(needleAngle)}
          </span>
          <span className="text-xl font-bold text-emerald-500">°</span>
        </div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
          {lang === 'ml' ? 'ഖിബ്ല ദിശ (വടക്ക് നിന്ന്)' : 'Qibla from North'}
        </p>
      </div>

      {/* Start button / status */}
      {!started ? (
        <button onClick={startCompass}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20">
          <Compass size={16} />
          {lang === 'ml' ? 'ലൈവ് കോമ്പസ് ഓൺ ചെയ്യുക' : 'Enable Live Compass'}
        </button>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {bearing !== null
            ? (lang === 'ml' ? 'ഉപകരണം ഖിബ്ലയ്ക്ക് നേരെ പിടിക്കുക' : 'Point your device toward the green needle')
            : (lang === 'ml' ? 'ഉപകരണം ചലിപ്പിക്കുക...' : 'Move device to calibrate...')}
        </p>
      )}

      {permErr && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl">
          {permErr}
        </p>
      )}
    </div>
  );
};

// ── PDF Viewer Modal ──────────────────────────────────────────────────────────

const PdfViewerModal = ({ pdf, onClose }) => {
  useEffect(() => {
    if (!pdf) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [pdf]);

  return createPortal(
    <AnimatePresence>
      {pdf && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex flex-col"
          style={{ zIndex: 9999 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white transition-colors"
          >
            <X size={16} />
          </button>
          <iframe src={pdf.url} title={pdf.title} className="flex-1 w-full border-0 min-h-0" />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ── Library Card ──────────────────────────────────────────────────────────────

const LibraryCard = ({ item, type, lang, onOpen }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onOpen}
    className="group relative flex flex-col gap-3 p-5 bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {item.title}
        </h3>
        {item.arabic_title && (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mt-0.5" dir="rtl">{item.arabic_title}</p>
        )}
        {type === 'dua' && item.category && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold">
            <Tag size={9} /> {item.category}
          </span>
        )}
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
        <FileText size={14} className="text-emerald-600 dark:text-emerald-400" />
      </div>
    </div>
    {item.description && (
      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
    )}
    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
      {lang === 'ml' ? 'PDF കാണുക' : 'View PDF'} <ChevronRight size={12} />
    </div>
  </motion.div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const IslamicServicesPage = () => {
  const { t, i18n } = useTranslation();
  const { tenant }  = usePortal();
  const lang        = i18n.language;

  const [surahs,      setSurahs]      = useState([]);
  const [duas,        setDuas]        = useState([]);
  const [surahLoad,   setSurahLoad]   = useState(true);
  const [duaLoad,     setDuaLoad]     = useState(true);
  const [duaCategory, setDuaCategory] = useState('');
  const [activePdf,   setActivePdf]   = useState(null);

  const openPdf = (item) => {
    const url = getPdfUrl(item.pdf_file);
    if (url) setActivePdf({ url, title: item.title, arabic_title: item.arabic_title });
  };

  const prayerLocation    = tenant?.prayer_location || {};
  const hasLocation       = !!(prayerLocation.latitude && prayerLocation.longitude);

  useEffect(() => {
    getPublicSurahs().then((res) => setSurahs(res?.data || [])).catch(() => setSurahs([])).finally(() => setSurahLoad(false));
  }, []);

  useEffect(() => {
    setDuaLoad(true);
    getPublicDuas({ category: duaCategory || undefined }).then((res) => setDuas(res?.data || [])).catch(() => setDuas([])).finally(() => setDuaLoad(false));
  }, [duaCategory]);

  const duaCategories = [...new Set(duas.map((d) => d.category).filter(Boolean))];

  return (
    <PortalLayout>
      <PdfViewerModal pdf={activePdf} onClose={() => setActivePdf(null)} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center mx-auto mb-5 text-3xl">
            🕌
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            {t('portal.islamic.title', { defaultValue: 'Islamic Services' })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
            {t('portal.islamic.subtitle', { defaultValue: 'Prayer times, Qibla direction, Surahs & Duas' })}
          </p>
        </motion.div>

        <div className="space-y-10">
          {/* ── Prayer Times ── */}
          {hasLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 p-6 shadow-sm"
            >
              <SectionHeader
                icon={Clock}
                titleEn={t('portal.islamic.prayerTimes', { defaultValue: 'Prayer Times' })}
                titleMl="നമസ്കാര സമയം"
                color="bg-emerald-500"
                lang={lang}
              />
              <PrayerTimesSection prayerLocation={prayerLocation} lang={lang} />
            </motion.div>
          )}

          {/* ── Qibla ── */}
          {hasLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 p-6 shadow-sm"
            >
              <SectionHeader
                icon={Compass}
                titleEn={t('portal.islamic.qibla', { defaultValue: 'Qibla Direction' })}
                titleMl="ഖിബ്ല ദിശ"
                color="bg-teal-500"
                lang={lang}
              />
              <QiblaSection prayerLocation={prayerLocation} lang={lang} />
            </motion.div>
          )}

          {/* ── Surah Library ── */}
          {(surahLoad || surahs.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 p-6 shadow-sm"
            >
              <SectionHeader
                icon={BookOpen}
                titleEn={t('portal.islamic.surahLibrary', { defaultValue: 'Surah Library' })}
                titleMl="സൂറ ലൈബ്രറി"
                color="bg-blue-500"
                lang={lang}
              />
              {surahLoad ? (
                <div className="flex justify-center py-6"><RefreshCw size={22} className="animate-spin text-blue-500" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {surahs.map((s) => (
                    <LibraryCard key={s._id} item={s} type="surah" lang={lang} onOpen={() => openPdf(s)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Dua Library ── */}
          {(duaLoad || duas.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 p-6 shadow-sm"
            >
              <SectionHeader
                icon={Moon}
                titleEn={t('portal.islamic.duaLibrary', { defaultValue: 'Dua Library' })}
                titleMl="ദുആ ലൈബ്രറി"
                color="bg-purple-500"
                lang={lang}
              />
              {/* Category filter */}
              {duaCategories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button onClick={() => setDuaCategory('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!duaCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {lang === 'ml' ? 'എല്ലാം' : 'All'}
                  </button>
                  {duaCategories.map((c) => (
                    <button key={c} onClick={() => setDuaCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${duaCategory === c ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {duaLoad ? (
                <div className="flex justify-center py-6"><RefreshCw size={22} className="animate-spin text-purple-500" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {duas.map((d) => (
                    <LibraryCard key={d._id} item={d} type="dua" lang={lang} onOpen={() => openPdf(d)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default IslamicServicesPage;
