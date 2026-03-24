'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Navbar({ email, onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await onLogout();
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Image src="/logo.png" alt="Vauriz Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
        <span className="navbar-title">Vauriz</span>
      </div>
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
