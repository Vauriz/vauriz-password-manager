'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { encrypt, decrypt } from '@/lib/crypto';
import Navbar from '@/components/Navbar';
import PasswordCard from '@/components/PasswordCard';
import AddPasswordModal from '@/components/AddPasswordModal';
import AddLegacyModal from '@/components/AddLegacyModal';
import EditLegacyModal from '@/components/EditLegacyModal';
import LegacyCard from '@/components/LegacyCard';

export default function DashboardClient({ userEmail, userId }) {
  const [supabase] = useState(() => createClient());
  const [passwords, setPasswords] = useState([]);
  const [legacyShares, setLegacyShares] = useState([]);
  
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [masterKey, setMasterKey] = useState('');
  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(true);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' or 'legacy'
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLegacyModal, setShowLegacyModal] = useState(false);
  const [editingLegacyShare, setEditingLegacyShare] = useState(null);

  // Show a toast notification
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Fetch data when vault is unlocked
  useEffect(() => {
    if (!vaultUnlocked) return;
    let cancelled = false;

    async function loadData() {
      // 1. Fetch Passwords
      const { data: passData, error: passErr } = await supabase
        .from('passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (passErr) showToast('Failed to load passwords', 'error');
      
      // 2. Fetch Legacy Shares
      const { data: legacyData, error: legErr } = await supabase
        .from('legacy_shares')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (legErr) showToast('Failed to load legacy shares', 'error');

      if (!cancelled) {
        if (passData) setPasswords(passData);
        if (legacyData) {
          setLegacyShares(legacyData);
          
          // Update last_active_at for all pending shares since user just logged in
          const pendingIds = legacyData.filter(s => s.status === 'pending').map(s => s.id);
          if (pendingIds.length > 0) {
            await supabase.from('legacy_shares')
              .update({ last_active_at: new Date().toISOString() })
              .in('id', pendingIds);
          }
        }
        setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [vaultUnlocked, supabase]);

  // ---------- VAULT ACTIONS ----------
  async function handleDecrypt(ciphertext, iv) {
    return await decrypt(ciphertext, iv, masterKey);
  }

  async function handleAddPassword({ siteName, siteUrl, username, password, notes }) {
    const { ciphertext, iv } = await encrypt(password, masterKey);
    const { error } = await supabase.from('passwords').insert({
      user_id: userId, site_name: siteName, site_url: siteUrl || null,
      username, encrypted_password: ciphertext, iv, notes: notes || null,
    });

    if (error) throw error;
    showToast('Password saved successfully!');
    
    // Refresh
    const { data } = await supabase.from('passwords').select('*').order('created_at', { ascending: false });
    if (data) setPasswords(data);
  }

  async function handleDeletePassword(id) {
    if (!confirm('Delete this password entry?')) return;
    const { error } = await supabase.from('passwords').delete().eq('id', id);
    if (error) { showToast('Failed to delete', 'error'); } 
    else { showToast('Password deleted'); setPasswords(prev => prev.filter(p => p.id !== id)); }
  }

  // ---------- LEGACY SHARES ACTIONS ----------
  async function handleAddLegacy({ shareName, recipient, message, passphrase, timerInterval }) {
    // Encrypt the legacy message using the generated passphrase (not the master key!)
    const { ciphertext, iv } = await encrypt(message, passphrase);
    
    const { error } = await supabase.from('legacy_shares').insert({
      user_id: userId,
      share_name: shareName || 'Unnamed Share',
      recipient_email: recipient,
      encrypted_payload: ciphertext,
      iv: iv,
      timer_interval: timerInterval,
      status: 'pending',
      last_active_at: new Date().toISOString()
    });

    if (error) throw error;
    showToast('Legacy Share created securely!');
    
    // Refresh
    const { data } = await supabase.from('legacy_shares').select('*').order('created_at', { ascending: false });
    if (data) setLegacyShares(data);
  }

  async function handleEditLegacy(id, { shareName, recipient, timerInterval }) {
    const { error } = await supabase.from('legacy_shares').update({
      share_name: shareName || 'Unnamed Share',
      recipient_email: recipient,
      timer_interval: timerInterval
    }).eq('id', id);

    if (error) { showToast('Failed to update', 'error'); } 
    else { 
      showToast('Legacy Share updated'); 
      setLegacyShares(prev => prev.map(s => s.id === id ? { ...s, share_name: shareName || 'Unnamed Share', recipient_email: recipient, timer_interval: timerInterval } : s));
    }
  }

  async function handleDeleteLegacy(id) {
    if (!confirm('Delete this legacy share? The recipient will no longer receive it.')) return;
    const { error } = await supabase.from('legacy_shares').delete().eq('id', id);
    if (error) { showToast('Failed to delete', 'error'); } 
    else { showToast('Legacy share deleted'); setLegacyShares(prev => prev.filter(p => p.id !== id)); }
  }

  // ---------- GENERAL ----------
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  function handleMasterKeySubmit(e) {
    e.preventDefault();
    if (masterKey.length < 1) return;
    setShowMasterKeyPrompt(false);
    setVaultUnlocked(true);
  }

  const filteredPasswords = useMemo(() =>
    passwords.filter(p => p.site_name.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase())),
    [passwords, search]
  );

  // ---------- RENDER ----------
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
              <label>Master Password</label>
              <input type="password" className="input" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '20px' }}>Unlock Vault</button>
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
        <div className="dashboard-header flex-col" style={{ alignItems: 'flex-start', gap: '20px' }}>
          <div className="flex-between" style={{ width: '100%' }}>
            <h2>{activeTab === 'vault' ? 'Your Vault' : 'Legacy Shares'}</h2>
            <div className="dashboard-stats">
              <span className="stat-badge">
                {activeTab === 'vault' ? passwords.length : legacyShares.length} entries
              </span>
            </div>
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
            <button 
              className={`btn ${activeTab === 'vault' ? 'btn-primary' : 'glass-card'}`}
              onClick={() => setActiveTab('vault')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none' }}
            >
              🔐 Password Vault
            </button>
            <button 
              className={`btn ${activeTab === 'legacy' ? 'btn-primary' : 'glass-card'}`}
              onClick={() => setActiveTab('legacy')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none' }}
            >
              ⏳ Dead Man's Switch
            </button>
          </div>
        </div>

        {activeTab === 'vault' && (
          <div className="search-bar">
            <div className="search-bar-wrapper">
              <span className="search-bar-icon">🔍</span>
              <input type="text" className="input" placeholder="Search passwords..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
        ) : activeTab === 'vault' ? (
          // VAULT VIEW
          filteredPasswords.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <h3>{search ? 'No results found' : 'Your vault is empty'}</h3>
              {!search && <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>Add Password</button>}
            </div>
          ) : (
            <div className="password-grid">
              {filteredPasswords.map(entry => (
                <PasswordCard key={entry.id} entry={entry} onDecrypt={handleDecrypt} onDelete={handleDeletePassword} />
              ))}
            </div>
          )
        ) : (
          // LEGACY VIEW
          legacyShares.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <h3>No Legacy Shares</h3>
              <p>Securely share messages or passwords if you are inactive.</p>
              <button className="btn btn-primary" onClick={() => setShowLegacyModal(true)}>Create Legacy Share</button>
            </div>
          ) : (
            <div className="password-grid">
              {legacyShares.map(entry => (
                <LegacyCard key={entry.id} entry={entry} onDelete={handleDeleteLegacy} onEdit={setEditingLegacyShare} />
              ))}
            </div>
          )
        )}
      </div>

      {/* FAB */}
      <button 
        className="fab" 
        onClick={() => activeTab === 'vault' ? setShowPasswordModal(true) : setShowLegacyModal(true)} 
        title={`Add ${activeTab === 'vault' ? 'password' : 'legacy share'}`}
      >
        +
      </button>

      {/* Modals */}
      {showPasswordModal && <AddPasswordModal onClose={() => setShowPasswordModal(false)} onAdd={handleAddPassword} />}
      {showLegacyModal && <AddLegacyModal onClose={() => setShowLegacyModal(false)} onAdd={handleAddLegacy} />}
      {editingLegacyShare && <EditLegacyModal share={editingLegacyShare} onClose={() => setEditingLegacyShare(null)} onSave={handleEditLegacy} />}

      {/* Toast */}
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.message}</div></div>}
    </div>
  );
}
