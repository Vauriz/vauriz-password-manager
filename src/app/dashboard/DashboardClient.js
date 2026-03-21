'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { encrypt, decrypt } from '@/lib/crypto';
import Navbar from '@/components/Navbar';
import PasswordCard from '@/components/PasswordCard';
import AddPasswordModal from '@/components/AddPasswordModal';

export default function DashboardClient({ userEmail, userId }) {
  const [supabase] = useState(() => createClient());
  const [passwords, setPasswords] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [masterKey, setMasterKey] = useState('');
  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(true);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  // Show a toast notification
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Fetch passwords when vault is unlocked
  useEffect(() => {
    if (!vaultUnlocked) return;
    let cancelled = false;

    async function loadPasswords() {
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        showToast('Failed to load passwords', 'error');
      } else {
        setPasswords(data || []);
      }
      setLoading(false);
    }

    loadPasswords();
    return () => { cancelled = true; };
  }, [vaultUnlocked, supabase]);

  // Decrypt a password
  async function handleDecrypt(ciphertext, iv) {
    return await decrypt(ciphertext, iv, masterKey);
  }

  // Add a new password
  async function handleAdd({ siteName, siteUrl, username, password, notes }) {
    const { ciphertext, iv } = await encrypt(password, masterKey);

    const { error } = await supabase.from('passwords').insert({
      user_id: userId,
      site_name: siteName,
      site_url: siteUrl || null,
      username,
      encrypted_password: ciphertext,
      iv,
      notes: notes || null,
    });

    if (error) {
      showToast('Failed to save password', 'error');
      throw error;
    }

    showToast('Password saved successfully!');

    // Re-fetch passwords
    const { data } = await supabase
      .from('passwords')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPasswords(data);
  }

  // Delete a password
  async function handleDelete(id) {
    if (!confirm('Delete this password entry?')) return;

    const { error } = await supabase.from('passwords').delete().eq('id', id);

    if (error) {
      showToast('Failed to delete', 'error');
    } else {
      showToast('Password deleted');
      setPasswords((prev) => prev.filter((p) => p.id !== id));
    }
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  // Master key prompt
  function handleMasterKeySubmit(e) {
    e.preventDefault();
    if (masterKey.length < 1) return;
    setShowMasterKeyPrompt(false);
    setVaultUnlocked(true);
  }

  // Filter passwords by search
  const filtered = useMemo(() =>
    passwords.filter(
      (p) =>
        p.site_name.toLowerCase().includes(search.toLowerCase()) ||
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        (p.site_url && p.site_url.toLowerCase().includes(search.toLowerCase()))
    ),
    [passwords, search]
  );

  // Master key prompt screen
  if (showMasterKeyPrompt) {
    return (
      <div className="login-page">
        <div className="bg-grid" />
        <div className="bg-gradient-orb purple" />
        <div className="bg-gradient-orb blue" />
        <div className="login-container">
          <div className="login-header">
            <div className="login-logo">🔐</div>
            <h1>Unlock Vault</h1>
            <p>Enter your master password to decrypt your stored passwords</p>
          </div>
          <form className="glass-card login-form" onSubmit={handleMasterKeySubmit}>
            <div className="input-group">
              <label htmlFor="master-key">Master Password</label>
              <input
                id="master-key"
                type="password"
                className="input"
                placeholder="Enter your master password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '20px' }}>
              Unlock Vault
            </button>
            <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              For this MVP, use your login password as the master password.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="bg-grid" />
      <div className="bg-gradient-orb purple" />
      <div className="bg-gradient-orb blue" />

      <Navbar email={userEmail || ''} onLogout={handleLogout} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Your Vault</h2>
          <div className="dashboard-stats">
            <span className="stat-badge">{passwords.length} entries</span>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-bar-wrapper">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              className="input"
              placeholder="Search passwords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <h3>{search ? 'No results found' : 'Your vault is empty'}</h3>
            <p>{search ? 'Try a different search term' : 'Click the + button to add your first password'}</p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Add First Password
              </button>
            )}
          </div>
        ) : (
          <div className="password-grid">
            {filtered.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onDecrypt={handleDecrypt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal(true)} title="Add new password">
        +
      </button>

      {/* Add Modal */}
      {showModal && (
        <AddPasswordModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}
    </div>
  );
}
