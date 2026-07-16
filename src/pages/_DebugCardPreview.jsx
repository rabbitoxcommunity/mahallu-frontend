import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Card } from '../components/family/HouseMembershipCard';

const mockHouse = {
  house_code: 'H-0042',
  householder_name: 'Muhammed Abdul Rahman',
  family_id: { family_name: 'Rahman Family' },
  address: '12/A, Green Villa, Near Juma Masjid, Kondotty, Malappuram',
  primary_contact: '+91 98765 43210',
  economic_status: 'General',
};

const signatureSvg = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="90">
  <path d="M10 60 C 30 20, 50 80, 70 40 S 110 10, 130 50 S 170 70, 190 30 S 220 60, 230 40"
        stroke="black" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>
`)}`;

export default function DebugCardPreview() {
  const [dataUrl, setDataUrl] = useState('');

  const testDownload = async () => {
    const cardEl = document.getElementById('membership-card');
    const url = await toPng(cardEl, { pixelRatio: 6, skipFonts: true, style: { borderRadius: '0' } });
    setDataUrl(url);
    window.__EXPORT_RESULT__ = `SUCCESS len=${url.length}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 40 }}>
      <Card house={mockHouse} orgName="Al-Noor Mahallu" signatoryTitle="Secretary" signatureUrl={signatureSvg} />
      <button id="test-download" onClick={testDownload} style={{ padding: '8px 16px', background: '#0B65F6', color: '#fff', borderRadius: 8 }}>
        Test Download
      </button>
      {dataUrl && <img id="exported-img" src={dataUrl} alt="exported" style={{ width: '85.6mm', boxShadow: '0 0 0 2px red' }} />}
    </div>
  );
}
