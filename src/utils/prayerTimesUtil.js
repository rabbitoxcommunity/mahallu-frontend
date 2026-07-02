// Prayer time calculation — lightweight pure-JS implementation
// Algorithm: standard astronomical formulas (same basis as adhan.js)

const METHODS = {
  MWL:   { fajrAngle: 18,   ishaAngle: 17 },
  ISNA:  { fajrAngle: 15,   ishaAngle: 15 },
  Egypt: { fajrAngle: 19.5, ishaAngle: 17.5 },
  MF:    { fajrAngle: 12,   ishaAngle: 15 },
};

const toRad  = (d) => (d * Math.PI) / 180;
const toDeg  = (r) => (r * 180) / Math.PI;
const fixAng = (a) => a - 360 * Math.floor(a / 360);
const fixHr  = (a) => a - 24  * Math.floor(a / 24);

function julianDate(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPos(jd) {
  const D  = jd - 2451545.0;
  const g  = fixAng(357.529 + 0.98560028 * D);
  const q  = fixAng(280.459 + 0.98564736 * D);
  const L  = fixAng(q + 1.915 * Math.sin(toRad(g)) + 0.02 * Math.sin(toRad(2 * g)));
  const e  = 23.439 - 0.0000004 * D;
  const RA = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L)))) / 15;
  return {
    decl: toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L)))),
    EqT:  q / 15 - fixHr(RA),
  };
}

function hourAngle(lat, decl, angle) {
  const num = -Math.sin(toRad(angle)) - Math.sin(toRad(lat)) * Math.sin(toRad(decl));
  const den = Math.cos(toRad(lat)) * Math.cos(toRad(decl));
  if (Math.abs(num / den) > 1) return null;
  return toDeg(Math.acos(num / den)) / 15;
}

function asrAngle(lat, decl, shadow = 1) {
  // Shadow factor: 1 = Shafi/Hanbali, 2 = Hanafi
  const angle = toDeg(Math.atan(1 / (shadow + Math.tan(toRad(Math.abs(lat - decl))))));
  return hourAngle(lat, decl, -angle);
}

function fmtTime(h) {
  if (h === null) return '--:--';
  let hh = Math.floor(h) % 24;
  let mm = Math.round((h - Math.floor(h)) * 60);
  if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12  = hh % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
}

function fmtTime24(h) {
  if (h === null) return '--:--';
  let hh = Math.floor(h) % 24;
  let mm = Math.round((h - Math.floor(h)) * 60);
  if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Calculate prayer times.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Date}   date - Date to calculate for (defaults to today)
 * @param {string} method - Calculation method: 'MWL' | 'ISNA' | 'Egypt' | 'MF'
 * @returns {{ fajr, sunrise, dhuhr, asr, maghrib, isha }} — 12h formatted strings
 */
export function calcPrayerTimes(lat, lng, date = new Date(), method = 'MWL') {
  const tz  = -date.getTimezoneOffset() / 60;
  const jd  = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);
  const { decl, EqT } = sunPos(jd);
  const m   = METHODS[method] || METHODS.MWL;

  const noon = 12 - EqT;
  // Convert solar time → civil time: add timezone offset, subtract longitude offset
  const offset = tz - lng / 15;

  const fHA  = hourAngle(lat, decl, m.fajrAngle);
  const srHA = hourAngle(lat, decl, 0.833);
  const aHA  = asrAngle(lat, decl, 1);
  const mgHA = hourAngle(lat, decl, 0.833);
  const isHA = hourAngle(lat, decl, m.ishaAngle);

  const t = (h) => ({ display: fmtTime(fixHr(h)), raw: fixHr(h) });

  return {
    fajr:    t(noon - (fHA  ?? 0) + offset),
    sunrise: t(noon - (srHA ?? 0) + offset),
    dhuhr:   t(noon              + offset),
    asr:     t(noon + (aHA  ?? 0) + offset),
    maghrib: t(noon + (mgHA ?? 0) + offset),
    isha:    t(noon + (isHA ?? 0) + offset),
  };
}

/**
 * Calculate Qibla bearing from location.
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @returns {number} Bearing in degrees (0 = North, clockwise)
 */
export function calcQiblaDirection(lat, lng) {
  const KLat = 21.4225;
  const KLng = 39.8262;
  const dLng = toRad(KLng - lng);
  const la1  = toRad(lat);
  const la2  = toRad(KLat);
  const y    = Math.sin(dLng) * Math.cos(la2);
  const x    = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Get current + next prayer given prayer times.
 * @param {{ fajr, sunrise, dhuhr, asr, maghrib, isha }} times
 * @returns {{ current: string|null, next: string|null }}
 */
export function getCurrentAndNextPrayer(times) {
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;

  const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (let i = 0; i < order.length; i++) {
    const t = times[order[i]]?.raw;
    if (t !== null && t !== undefined && nowH < t) {
      return {
        current: i > 0 ? order[i - 1] : null,
        next:    order[i],
      };
    }
  }
  return { current: 'isha', next: 'fajr' };
}
