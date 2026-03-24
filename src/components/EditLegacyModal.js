import { useState } from 'react';

export default function EditLegacyModal({ share, onClose, onSave }) {
  const [shareName, setShareName] = useState(share.share_name || '');
  const [recipient, setRecipient] = useState(share.recipient_email || '');
  const [timerInterval, setTimerInterval] = useState(share.timer_interval || '14 days');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(share.id, { shareName, recipient, timerInterval });
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Legacy Metadata</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="toast-container" style={{ position: 'relative', marginBottom: '20px' }}>
          <div className="toast toast-info" style={{ width: '100%', padding: '12px' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔒</span>
            Zero-Knowledge Enforced: You cannot view or overwrite the securely encrypted message.
          </div>
        </div>

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

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{width:16, height:16, borderWidth:2}}/> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
