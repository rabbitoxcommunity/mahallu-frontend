// Free, unofficial Google Translate endpoint - no API key required.
const TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

const MALAYALAM_RANGE = /[ഀ-ൿ]/;

export const isMalayalam = (text) => MALAYALAM_RANGE.test(text || '');

export async function translateText(text, targetLang = 'ml', sourceLang = 'en') {
  const { translated } = await translateWithSuggestions(text, targetLang, sourceLang);
  return translated;
}

// Translates `text` and also returns alternate translations (Google's "dt=at"
// response) so the caller can offer them as suggestions.
export async function translateWithSuggestions(text, targetLang = 'ml', sourceLang = 'en') {
  const value = (text || '').trim();
  if (!value) return { translated: value, suggestions: [] };

  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang,
    tl: targetLang,
    q: value,
  });
  params.append('dt', 't');
  params.append('dt', 'at');

  const res = await fetch(`${TRANSLATE_ENDPOINT}?${params.toString()}`);
  if (!res.ok) throw new Error('Translation request failed');

  const data = await res.json();
  const translated = (data?.[0] || []).map((chunk) => chunk[0]).join('') || value;
  const alternates = (data?.[5]?.[0]?.[2] || []).map((entry) => entry[0]);
  const suggestions = [...new Set([translated, ...alternates])].filter(Boolean);

  return { translated, suggestions };
}
