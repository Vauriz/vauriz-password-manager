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
            >
              <option value="2 minutes">2 Minutes (Test Mode)</option>
              <option value="1 day">1 Day</option>
              <option value="7 days">7 Days</option>
              <option value="14 days">14 Days</option>
              <option value="30 days">30 Days</option>
            </select>
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

          <div className="passphrase-box" style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
            <h4 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>Crucial Step: Secret Passphrase</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Your message is encrypted with this precise key. We <strong>do not</strong> save it on our servers. You must give this passphrase to your recipient <strong>now</strong> (e.g. via WhatsApp).
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <code style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '1.1rem', color: 'var(--text-bright)', textAlign: 'center', letterSpacing: '1px' }}>
                {passphrase}
              </code>
              <button type="button" className="input-icon-btn" onClick={handleCopy} title="Copy Passphrase">
                📋
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
