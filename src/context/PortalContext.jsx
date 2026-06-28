import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchTenantInfo, getTenantSlug } from '../api/portalService';

const PortalContext = createContext({ tenant: null, slug: '', loading: true, error: null });

export const PortalProvider = ({ children }) => {
  // Save slug synchronously during render — before any child effects fire
  const urlSlug = new URLSearchParams(window.location.search).get('t');
  if (urlSlug) localStorage.setItem('portal_tenant', urlSlug);
  const slug = localStorage.getItem('portal_tenant') || '';

  const [tenant, setTenant]   = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetchTenantInfo()
      .then(res => setTenant(res.data))
      .catch(() => setError('Could not load portal information.'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PortalContext.Provider value={{ tenant, slug, loading, error }}>
      {children ?? <Outlet />}
    </PortalContext.Provider>
  );
};

export const usePortal = () => useContext(PortalContext);
