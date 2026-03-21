'use client';

import { useState } from 'react';

export default function Navbar({ email, onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await onLogout();
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">V</div>
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
