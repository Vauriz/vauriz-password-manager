export default function LegacyCard({ entry, onDelete }) {
  const isDelivered = entry.status === 'delivered';
  
  return (
    <div className="glass-card flex-col" style={{ borderLeft: isDelivered ? '4px solid #10b981' : '4px solid #f59e0b' }}>
      <div className="flex-between">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDelivered ? '📬' : '⏳'} To: {entry.recipient_email}
        </h3>
        <button
          className="icon-btn text-danger"
          onClick={() => onDelete(entry.id)}
          title="Delete Legacy Share"
        >
          🗑️
        </button>
      </div>

      <div className="card-details" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Timer:</strong> {entry.timer_interval} of inactivity
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Status:</strong> 
          <span style={{ 
            marginLeft: '6px', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '0.75rem',
            background: isDelivered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: isDelivered ? '#10b981' : '#f59e0b'
          }}>
            {isDelivered ? 'Delivered' : 'Pending'}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.8, marginTop: '4px' }}>
          Last active: {new Date(entry.last_active_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
