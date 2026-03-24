'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({ email, onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await onLogout();
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <Image src="/logo.png" alt="Vauriz Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
        <span className="navbar-title">Vauriz</span>
      </Link>
      <div className="navbar-actions">
        <span className="navbar-user">{email}</span>
        <button
          className="btn btn-secondary"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        >
          {loggingOut ? <span className="spinner" /> : 'Logout'}
        </button>
      </div>
    </nav>
  );
}
