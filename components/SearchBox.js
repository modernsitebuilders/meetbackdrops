// components/SearchBox.js
//
// Header search entry point. Deliberately dumb: it only navigates to /search?q=…
// It does NOT load the search index — the index is fetched lazily on the /search
// page itself, so putting this box site-wide adds zero weight to other pages.

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SearchBox({ compact = false }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <form onSubmit={submit} role="search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span aria-hidden="true" style={{ position: 'absolute', left: '0.7rem', fontSize: '0.9rem', color: '#9ca3af', pointerEvents: 'none' }}>⌕</span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search backgrounds…"
        aria-label="Search backgrounds"
        style={{
          width: compact ? '100%' : '210px',
          padding: '0.5rem 0.75rem 0.5rem 1.7rem',
          borderRadius: '999px',
          border: '1px solid #e5e7eb',
          background: '#fafafa',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          color: '#374151',
          outline: 'none',
        }}
      />
    </form>
  );
}
