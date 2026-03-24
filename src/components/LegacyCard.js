export default function LegacyCard({ entry, onDelete, onEdit }) {
  const isDelivered = entry.status === 'delivered';
  const statusClass = isDelivered ? 'delivered' : 'pending';
  
  return (
    <div className={`glass-card legacy-card status-${statusClass}`}>
      
      {/* Header section: Email and Actions */}
      <div className="legacy-card-header">
        <div className="legacy-info">
          <span className="legacy-label">{entry.share_name || 'Unnamed Share'}</span>
          <h3 className="legacy-email" title={entry.recipient_email}>
            {entry.recipient_email}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isDelivered && (
            <button
              className="icon-btn legacy-delete-btn"
              onClick={() => onEdit(entry)}
              title="Edit Legacy Share"
              style={{ color: '#60a5fa' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          )}
          
          <button
            className="icon-btn text-danger legacy-delete-btn"
            onClick={() => onDelete(entry.id)}
            title="Revoke Legacy Share"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      {/* Middle section: Stats / Metrics */}
      <div className="legacy-stats">
        <div className="legacy-stat-item">
          <span className="legacy-label">Trigger</span>
          <span className="legacy-stat-value">{entry.timer_interval} inactive</span>
        </div>
        
        <div className="legacy-stat-item">
          <span className="legacy-label">Status</span>
          <span className={`status-badge ${statusClass}`}>
            <span className="status-dot"></span>
            {isDelivered ? 'Delivered' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Footer section: Timestamp */}
      <div className="legacy-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Last active: {new Date(entry.last_active_at).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
      </div>
    </div>
  );
}
