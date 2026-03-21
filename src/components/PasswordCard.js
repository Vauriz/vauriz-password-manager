'use client';

import { useState } from 'react';

export default function PasswordCard({ entry, onDecrypt, onDelete }) {
  const [revealed, setRevealed] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const siteLetter = entry.site_name ? entry.site_name[0] : '?';

  async function handleReveal() {
    if (revealed) {
      setRevealed(false);
      setDecryptedPassword('');
      return;
    }
    setLoading(true);
    try {
      const pwd = await onDecrypt(entry.encrypted_password, entry.iv);
      setDecryptedPassword(pwd);
      setRevealed(true);
    } catch {
      setDecryptedPassword('Decryption failed');
      setRevealed(true);
    }
    setLoading(false);
  }

  async function handleCopy(text, field) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    } catch {}
  }

  async function handleCopyPassword() {
    try {
      const pwd = await onDecrypt(entry.encrypted_password, entry.iv);
      await navigator.clipboard.writeText(pwd);
      setCopied('password');
      setTimeout(() => setCopied(''), 2000);
    } catch {}
  }

  return (
    <div className="glass-card password-card">
      <div className="password-card-header">
        <div className="password-card-site">
          <div className="password-card-favicon">{siteLetter}</div>
          <div>
            <div className="password-card-name">{entry.site_name}</div>
            {entry.site_url && (
              <div className="password-card-url">{entry.site_url}</div>
            )}
          </div>
        </div>
        <div className="password-card-actions">
          <button title="Delete" className="delete" onClick={() => onDelete(entry.id)}>
            🗑️
          </button>
        </div>
      </div>

      <div className="password-card-field">
        <div>
          <div className="password-card-field-label">Username</div>
          <div className="password-card-field-value">{entry.username}</div>
        </div>
        <button
          className="btn btn-icon btn-secondary"
          onClick={() => handleCopy(entry.username, 'username')}
          title="Copy username"
          style={{ fontSize: '0.75rem', padding: '6px 8px' }}
        >
          {copied === 'username' ? '✓' : '📋'}
        </button>
      </div>

      <div className="password-card-field">
        <div>
          <div className="password-card-field-label">Password</div>
          <div className="password-card-field-value">
            {loading ? (
              <span className="spinner" />
            ) : revealed ? (
              decryptedPassword
            ) : (
              '••••••••'
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn btn-icon btn-secondary"
            onClick={handleReveal}
            title={revealed ? 'Hide password' : 'Show password'}
            style={{ fontSize: '0.75rem', padding: '6px 8px' }}
          >
            {revealed ? '🙈' : '👁️'}
          </button>
          <button
            className="btn btn-icon btn-secondary"
            onClick={handleCopyPassword}
            title="Copy password"
            style={{ fontSize: '0.75rem', padding: '6px 8px' }}
          >
            {copied === 'password' ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {entry.notes && (
        <div className="password-card-notes">{entry.notes}</div>
      )}
    </div>
  );
}
