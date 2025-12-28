function ClaimTimeline({ auditLogs = [], sla = {} }) {
  // Action mapping to human-readable labels
  const actionLabels = {
    'CLAIM_SUBMITTED': 'Claim Submitted',
    'APPROVED': 'Approved by Department',
    'REJECTED': 'Rejected',
    'MARK_PAID': 'Payment Released',
    'PAID': 'Payment Released'
  };

  // Sort logs chronologically
  const sortedLogs = [...auditLogs].sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  // Build timeline entries
  const timelineEntries = sortedLogs.map(log => ({
    id: log.id,
    title: actionLabels[log.action] || log.action,
    actor: log.actorRole || log.approvedBy || 'System',
    timestamp: log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt),
    isBreach: false
  }));

  // Add derived SLA breach entry if escalated
  if (sla.isEscalated) {
    timelineEntries.push({
      id: 'sla-breach',
      title: 'SLA Breach Detected',
      actor: 'System',
      timestamp: new Date(), // Approximate, could be derived from elapsed days
      isBreach: true
    });
  }

  // Sort again after adding breach entry
  timelineEntries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (timelineEntries.length === 0) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>Claim Lifecycle</h3>
      
      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        {/* Vertical line */}
        <div style={{ 
          position: 'absolute', 
          left: '0.5rem', 
          top: '0.5rem', 
          bottom: '0.5rem', 
          width: '2px', 
          backgroundColor: '#e2e8f0' 
        }} />

        {timelineEntries.map((entry, index) => (
          <div 
            key={entry.id || index} 
            style={{ 
              position: 'relative', 
              marginBottom: index < timelineEntries.length - 1 ? '1.5rem' : '0',
              paddingLeft: '0.5rem'
            }}
          >
            {/* Dot marker */}
            <div style={{ 
              position: 'absolute', 
              left: '-1.5rem', 
              top: '0.25rem',
              width: '0.75rem', 
              height: '0.75rem', 
              borderRadius: '50%', 
              backgroundColor: entry.isBreach ? '#d32f2f' : '#2196f3',
              border: `2px solid ${entry.isBreach ? '#d32f2f' : '#2196f3'}`,
              boxShadow: '0 0 0 3px rgba(255,255,255,1)'
            }} />

            {/* Content */}
            <div>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '0.9rem', 
                color: entry.isBreach ? '#d32f2f' : '#2d3748',
                marginBottom: '0.25rem'
              }}>
                {entry.title}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#718096',
                lineHeight: '1.4'
              }}>
                <div>
                  <strong>Actor:</strong> {entry.actor}
                </div>
                <div>
                  <strong>Time:</strong> {entry.timestamp.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClaimTimeline;
