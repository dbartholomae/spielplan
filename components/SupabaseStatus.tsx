'use client';

import { useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SupabaseStatus() {
  const status = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasClient = Boolean(supabase);
    if (!url) return 'Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)';
    return hasClient ? 'Supabase client initialized ✅' : 'Supabase client failed to initialize ❌';
  }, []);

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderRadius: 8,
      background: '#f5f5f7',
      color: '#111',
      border: '1px solid #e5e5e5'
    }}>
      {status}
    </div>
  );
}
