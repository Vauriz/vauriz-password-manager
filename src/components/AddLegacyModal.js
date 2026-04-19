import { useState, useEffect } from 'react';
import { generatePassphrase } from '@/lib/crypto';

export default function AddLegacyModal({ onClose, onAdd }) {
  const [shareName, setShareName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [timerInterval, setTimerInterval] = useState('14 days');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseSaved, setPassphraseSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPassphrase(generatePassphrase());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!passphraseSaved) {
      alert("Please confirm you have saved the passphrase.");
      return;
    }
    setLoading(true);
    try {
      await onAdd({ shareName, recipient, message, passphrase, timerInterval });
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(passphrase);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Legacy Share</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          This message will be encrypted and automatically emailed to your recipient if you do not log in for the specified time.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label>Share Name (Optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Master Crypto Keys"
              value={shareName}
              onChange={(e) => setShareName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Recipient Email</label>
            <input
              className="input"
              type="email"
              placeholder="trusted.friend@example.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Inactivity Timer</label>
            <select 
              className="input" 
              value={timerInterval} 
              onChange={(e) => setTimerInterval(e.target.value)}
              style={{ appearance: 'none', background: 'var(--bg-card)', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3A%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3A%22292.4%22%20height%3A%22292.4%22%3E%3Cpath%20fill%3A%22%23a1a1aa%22%20d%3A%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '12px' }}
            >
              <option value="2 minutes">2 Minutes (Developer Test)</option>
              <option value="1 day">1 Day Inactive</option>
              <option value="7 days">7 Days Inactive</option>
              <option value="14 days">14 Days Inactive</option>
              <option value="30 days">30 Days Inactive</option>
            </select>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px'}}>
              If you don't login for this duration, we will dispatch the email.
            </span>
          </div>

          <div className="input-group">
            <label>Secure Message</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Write a message, leave instructions, or paste important passwords here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="passphrase-box" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '24px' }}>
            <h4 style={{ color: '#10b981', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
              Encryption Key Generated
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
              This is the <strong>only time</strong> you will see this key. Vauriz uses Zero-Knowledge architecture and <strong>cannot</strong> recover it. Provide it to your recipient securely.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <code style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '1.1rem', color: 'var(--text-primary)', textAlign: 'center', letterSpacing: '1.5px', userSelect: 'all' }}>
                {passphrase}
              </code>
              <button type="button" className="btn btn-secondary" onClick={handleCopy} title="Copy Passphrase" style={{ padding: '12px', minWidth: '46px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={passphraseSaved} 
                onChange={(e) => setPassphraseSaved(e.target.checked)} 
              />
              I have securely shared this passphrase with {recipient ? recipient : 'the recipient'}.
            </label>
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !passphraseSaved}>
              {loading ? <span className="spinner" style={{width:16, height:16, borderWidth:2}}/> : 'Encrypt & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
