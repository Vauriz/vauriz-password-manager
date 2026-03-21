'use client';

import { useState } from 'react';

export default function AddPasswordModal({ onClose, onAdd }) {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({ siteName, siteUrl, username, password, notes });
      onClose();
    } catch {
      setLoading(false);
    }
  }

  function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}';
    const arr = new Uint8Array(20);
    crypto.getRandomValues(arr);
    const generated = Array.from(arr, (byte) => chars[byte % chars.length]).join('');
    setPassword(generated);
    setShowPassword(true);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="glass-card modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3>Add New Password</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="input-group">
            <label htmlFor="site-name">Site Name *</label>
            <input
              id="site-name"
              type="text"
              className="input"
              placeholder="e.g. Google"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="site-url">URL</label>
            <input
              id="site-url"
              type="text"
              className="input"
              placeholder="e.g. https://google.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="username">Username / Email *</label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="your@email.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="new-password">Password *</label>
            <div className="input-with-icon">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={generatePassword}
              style={{ marginTop: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
            >
              🎲 Generate Strong Password
            </button>
          </div>

          <div className="input-group">
            <label htmlFor="notes">Notes</label>
            <input
              id="notes"
              type="text"
              className="input"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Save Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
