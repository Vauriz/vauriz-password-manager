'use client';

import { useState } from 'react';
import { decrypt } from '@/lib/crypto';
import Link from 'next/link';

export default function UnlockClient({ share }) {
  const [passphrase, setPassphrase] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleDecrypt(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Clean the passphrase (trim spaces)
      const cleanKey = passphrase.trim();
      
      // 2. Decrypt locally in browser
      const plaintext = await decrypt(share.encrypted_payload, share.iv, cleanKey);
      setDecryptedMessage(plaintext);
    } catch (err) {
      console.error(err);
      setError("Incorrect Passphrase or corrupted data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="bg-grid" />
      <div className="bg-gradient-orb purple" />
      <div className="bg-gradient-orb blue" />
      
      <div className="login-container" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <div className="login-logo">⏳</div>
          <h1>Legacy Message</h1>
          <p>This secure message was shared with <strong>{share.recipient_email}</strong></p>
        </div>

        {!decryptedMessage ? (
          <form className="glass-card login-form" onSubmit={handleDecrypt}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              This message is protected by military-grade AES-GCM encryption. It cannot be read without the specific 4-word passphrase the sender gave you.
            </p>

            <div className="input-group">
              <label>Secret Passphrase</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. apple-tree-river-stone"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '20px' }} disabled={loading}>
              {loading ? <span className="spinner" style={{width: 16, height: 16, borderWidth: 2}}/> : 'Decrypt Message'}
            </button>
          </form>
        ) : (
          <div className="glass-card" style={{ animation: 'cardAppear 0.5s ease-out' }}>
            <h3 style={{ color: '#10b981', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔓</span> Message Decrypted Successfully
            </h3>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-bright)',
              lineHeight: '1.6',
              fontSize: '1.05rem',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {decryptedMessage}
            </div>
            
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <Link href="/" className="btn" style={{ textDecoration: 'none' }}>
                Learn more about Vauriz
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
