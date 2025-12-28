import { useEffect, useState } from 'react';
import { useClaims } from './ClaimsContext';
import { fetchClaims, fetchClaimById } from './services/claimsService';
import { getPermittedActions, ActionType, Roles } from './utils/permissions';
import { writeAuditLog } from './services/auditLogService';
import CreateClaimForm from './components/CreateClaimForm';
import ClaimTimeline from './components/ClaimTimeline';

function App() {
  const { state, setClaimsState } = useClaims();
  const { claims } = state;
  const [currentRole, setCurrentRole] = useState(Roles.DepartmentApprover);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    async function loadClaims() {
      setClaimsState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchClaims();
        setClaimsState(prev => ({ ...prev, list: data, loading: false }));
      } catch (err) {
        setClaimsState(prev => ({ ...prev, error: err.message, loading: false }));
      }
    }
    loadClaims();
  }, [setClaimsState]);

  useEffect(() => {
    if (!claims.selectedClaimId) {
      setClaimsState(prev => ({ ...prev, selectedClaim: null }));
      return;
    }

    async function loadClaimDetail() {
      setClaimsState(prev => ({ ...prev, loadingDetail: true, errorDetail: null }));
      try {
        const data = await fetchClaimById(claims.selectedClaimId);
        setClaimsState(prev => ({ ...prev, selectedClaim: data, loadingDetail: false }));
      } catch (err) {
        setClaimsState(prev => ({ ...prev, errorDetail: err.message, loadingDetail: false }));
      }
    }
    loadClaimDetail();
  }, [claims.selectedClaimId, setClaimsState]);

  function handleClaimClick(claimId) {
    setClaimsState(prev => ({ ...prev, selectedClaimId: claimId }));
  }

  async function handleApprove() {
    if (!claims.selectedClaim || actionInProgress) return;

    setActionInProgress(true);
    try {
      await writeAuditLog({
        entityType: 'ReimbursementClaim',
        entityId: claims.selectedClaim.id,
        action: 'APPROVED',
        newValues: { status: 'APPROVED' },
        approvedBy: 'demo-approver'
      });

      // Local status update
      setClaimsState(prev => ({
        ...prev,
        list: prev.list.map(c => 
          c.id === claims.selectedClaim.id ? { ...c, status: 'APPROVED' } : c
        ),
        selectedClaim: prev.selectedClaim 
          ? { ...prev.selectedClaim, status: 'APPROVED' }
          : null
      }));
    } catch (err) {
      setClaimsState(prev => ({ ...prev, errorDetail: err.message }));
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleReject() {
    if (!claims.selectedClaim || actionInProgress) return;

    setActionInProgress(true);
    try {
      await writeAuditLog({
        entityType: 'ReimbursementClaim',
        entityId: claims.selectedClaim.id,
        action: 'REJECTED',
        newValues: { status: 'REJECTED' },
        approvedBy: 'demo-rejector'
      });

      // Local status update
      setClaimsState(prev => ({
        ...prev,
        list: prev.list.map(c => 
          c.id === claims.selectedClaim.id ? { ...c, status: 'REJECTED' } : c
        ),
        selectedClaim: prev.selectedClaim 
          ? { ...prev.selectedClaim, status: 'REJECTED' }
          : null
      }));
    } catch (err) {
      setClaimsState(prev => ({ ...prev, errorDetail: err.message }));
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleMarkPaid() {
    if (!claims.selectedClaim || actionInProgress) return;

    setActionInProgress(true);
    try {
      await writeAuditLog({
        entityType: 'ReimbursementClaim',
        entityId: claims.selectedClaim.id,
        action: 'MARK_PAID',
        newValues: { status: 'PAID' },
        approvedBy: 'demo-accounts'
      });

      // Local status update
      setClaimsState(prev => ({
        ...prev,
        list: prev.list.map(c => 
          c.id === claims.selectedClaim.id ? { ...c, status: 'PAID' } : c
        ),
        selectedClaim: prev.selectedClaim 
          ? { ...prev.selectedClaim, status: 'PAID' }
          : null
      }));
    } catch (err) {
      setClaimsState(prev => ({ ...prev, errorDetail: err.message }));
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleClaimCreated() {
    try {
      const data = await fetchClaims();
      setClaimsState(prev => ({ ...prev, list: data }));
    } catch (err) {
      setClaimsState(prev => ({ ...prev, error: err.message }));
    }
  }

  if (claims.loading) {
    return <div>Initializing Claim Registry...</div>;
  }

  if (claims.error) {
    return <div>System Error: {claims.error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f7fb' }}>
      <header style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1a202c' }}>Reimbursement Governance System</h1>
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '0.75rem', fontSize: '0.9rem', fontWeight: '500', color: '#4a5568' }}>Active Authority:</label>
          <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', border: '1px solid #cbd5e0', borderRadius: '4px', backgroundColor: 'white' }}>
            {Object.values(Roles).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '340px', borderRight: '1px solid #e2e8f0', overflowY: 'auto', backgroundColor: '#fafbfc', padding: '1.25rem' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '0.95rem', backgroundColor: '#fafbfc', color: '#2d3748' }}>
              Pending Claims Registry
            </div>
            <div style={{ padding: '0.75rem' }}>
            {claims.list.map(claim => {
              const isPaid = claim.status === 'PAID';
              const slaColor = claim.sla.slaStatus === 'BREACHED' ? '#d32f2f' : claim.sla.slaStatus === 'WARNING' ? '#f57c00' : '#2e7d32';
              const borderLeft = claim.sla.slaStatus === 'BREACHED' ? '4px solid #d32f2f' : claim.sla.slaStatus === 'WARNING' ? '4px solid #f57c00' : '4px solid #2e7d32';
              const bgTint = claim.sla.slaStatus === 'BREACHED' ? '#ffebee' : 'transparent';
              const isSelected = claims.selectedClaimId === claim.id;
              
              return (
                <div 
                  key={claim.id} 
                  onClick={() => handleClaimClick(claim.id)}
                  style={{ 
                    padding: '0.75rem', 
                    cursor: 'pointer', 
                    backgroundColor: isSelected ? '#e3f2fd' : bgTint,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    marginBottom: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderLeft: isPaid ? '4px solid #9e9e9e' : borderLeft,
                    borderRadius: '6px',
                    color: isPaid ? '#757575' : 'inherit',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 4px rgba(33, 150, 243, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isPaid ? bgTint : '#f7fafc';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = bgTint;
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#2d3748', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{claim.id}</span>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
                      {claim.sla.isEscalated && !isPaid && (
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '3px', backgroundColor: '#d32f2f', color: 'white', fontWeight: '700', letterSpacing: '0.3px' }}>
                          ESCALATED
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: isPaid ? '#9e9e9e' : slaColor, color: 'white', fontWeight: '600', letterSpacing: '0.3px' }}>
                        {claim.sla.slaStatus}
                      </span>
                    </div>
                  </div>
                  {claim.sla.isEscalated && !isPaid && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: '600', color: '#d32f2f', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>🚨</span>
                      <span>REQUIRES IMMEDIATE ATTENTION</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '1000px', width: '100%' }}>
          <CreateClaimForm currentRole={currentRole} onClaimCreated={handleClaimCreated} />
          {!claims.selectedClaimId && <div style={{ padding: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.95rem' }}>Select a claim to review accountability record</div>}
          {claims.loadingDetail && <div style={{ padding: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.95rem' }}>Retrieving claim documentation...</div>}
          {claims.errorDetail && <div style={{ padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', color: '#c53030', fontSize: '0.9rem' }}>Retrieval Error: {claims.errorDetail}</div>}
          {claims.selectedClaim && !claims.loadingDetail && (() => {
            const isPaid = claims.selectedClaim.status === 'PAID';
            const slaColor = claims.selectedClaim.sla.slaStatus === 'BREACHED' ? '#d32f2f' : claims.selectedClaim.sla.slaStatus === 'WARNING' ? '#f57c00' : '#2e7d32';
            const permittedActions = getPermittedActions(currentRole, claims.selectedClaim.status);
            const delayDays = claims.selectedClaim.sla.isEscalated ? claims.selectedClaim.sla.elapsedDays - 7 : 0;
            
            return (
              <div>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>Claim Details</h2>
                  <div style={{ display: 'grid', gap: '0.75rem', lineHeight: '1.6' }}>
                    <div><strong style={{ color: '#4a5568', fontWeight: '500' }}>Claim Reference:</strong> <span style={{ marginLeft: '0.5rem', color: '#2d3748' }}>{claims.selectedClaim.id}</span></div>
                    <div><strong style={{ color: '#4a5568', fontWeight: '500' }}>Organizational Unit:</strong> <span style={{ marginLeft: '0.5rem', color: '#2d3748' }}>{claims.selectedClaim.departmentId}</span></div>
                    <div><strong style={{ color: '#4a5568', fontWeight: '500' }}>Claim Amount:</strong> <span style={{ marginLeft: '0.5rem', color: '#2d3748', fontWeight: '500' }}>{claims.selectedClaim.amount} {claims.selectedClaim.currency}</span></div>
                    <div>
                      <strong style={{ color: '#4a5568', fontWeight: '500' }}>Processing Status:</strong> 
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: 
                          claims.selectedClaim.status === 'APPROVED' ? '#e8f5e9' :
                          claims.selectedClaim.status === 'SUBMITTED' ? '#fff8e1' :
                          claims.selectedClaim.status === 'REJECTED' ? '#ffebee' :
                          claims.selectedClaim.status === 'PAID' ? '#e3f2fd' :
                          '#f5f5f5',
                        color: 
                          claims.selectedClaim.status === 'APPROVED' ? '#2e7d32' :
                          claims.selectedClaim.status === 'SUBMITTED' ? '#f57c00' :
                          claims.selectedClaim.status === 'REJECTED' ? '#d32f2f' :
                          claims.selectedClaim.status === 'PAID' ? '#1976d2' :
                          '#757575'
                      }}>
                        {claims.selectedClaim.status}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ color: '#4a5568', fontWeight: '500' }}>Service Level Compliance:</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: '4px', 
                          backgroundColor: isPaid ? '#9e9e9e' : slaColor, 
                          color: 'white', 
                          fontWeight: '600', 
                          fontSize: '0.8rem', 
                          letterSpacing: '0.3px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}>
                          {claims.selectedClaim.sla.slaStatus}
                        </span>
                        {claims.selectedClaim.sla.isEscalated && !isPaid && (
                          <span style={{ 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '4px', 
                            backgroundColor: '#d32f2f', 
                            color: 'white', 
                            fontWeight: '700', 
                            fontSize: '0.7rem', 
                            letterSpacing: '0.5px',
                            boxShadow: '0 1px 3px rgba(211,47,47,0.3)'
                          }}>
                            ESCALATED
                          </span>
                        )}
                      </div>
                    </div>
                    <div><strong style={{ color: '#4a5568', fontWeight: '500' }}>Days Since Submission:</strong> <span style={{ marginLeft: '0.5rem', color: '#2d3748' }}>{claims.selectedClaim.sla.elapsedDays}</span></div>
                  </div>
                </div>
                
                {permittedActions.length > 0 && !isPaid && currentRole !== Roles.EscalationAuthority && currentRole !== Roles.SuperAdmin && (
                  <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.5rem', marginBottom: '1rem' }}>
                    {claims.selectedClaim.sla.slaStatus === 'BREACHED' && (
                      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', color: '#92400e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⚠️</span>
                        <span>Service Level Agreement Violation</span>
                      </div>
                    )}
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>Authorized Actions</h3>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {permittedActions.includes(ActionType.APPROVE) && (
                        <button 
                          onClick={handleApprove} 
                          disabled={actionInProgress}
                          style={{ 
                            padding: '0.65rem 1.25rem', 
                            backgroundColor: actionInProgress ? '#9e9e9e' : '#2e7d32', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: actionInProgress ? 'not-allowed' : 'pointer', 
                            fontWeight: '500', 
                            fontSize: '0.9rem',
                            opacity: actionInProgress ? 0.6 : 1
                          }}
                        >
                          {actionInProgress ? 'Processing...' : 'Authorize Approval'}
                        </button>
                      )}
                      {permittedActions.includes(ActionType.REJECT) && (
                        <button 
                          onClick={handleReject} 
                          disabled={actionInProgress}
                          style={{ 
                            padding: '0.65rem 1.25rem', 
                            backgroundColor: actionInProgress ? '#9e9e9e' : '#d32f2f', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: actionInProgress ? 'not-allowed' : 'pointer', 
                            fontWeight: '500', 
                            fontSize: '0.9rem',
                            opacity: actionInProgress ? 0.6 : 1
                          }}
                        >
                          {actionInProgress ? 'Processing...' : 'Deny Claim'}
                        </button>
                      )}
                      {permittedActions.includes(ActionType.MARK_PAID) && (
                        <button 
                          onClick={handleMarkPaid} 
                          disabled={actionInProgress}
                          style={{ 
                            padding: '0.65rem 1.25rem', 
                            backgroundColor: actionInProgress ? '#9e9e9e' : '#1976d2', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: actionInProgress ? 'not-allowed' : 'pointer', 
                            fontWeight: '500', 
                            fontSize: '0.9rem',
                            opacity: actionInProgress ? 0.6 : 1
                          }}
                        >
                          {actionInProgress ? 'Processing...' : 'Confirm Disbursement'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {claims.selectedClaim.sla.isEscalated && !isPaid && (
                  <div style={{ backgroundColor: '#fff', border: '2px solid #d32f2f', borderRadius: '8px', boxShadow: '0 2px 6px rgba(211,47,47,0.2)', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: '600', color: '#d32f2f', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🚨</span>
                        <span>ESCALATION NOTICE</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#c62828' }}><strong style={{ fontWeight: '600' }}>Overdue Period:</strong> <span style={{ marginLeft: '0.5rem' }}>{delayDays} days beyond service level deadline</span></div>
                    </div>
                    <div style={{ color: '#c62828', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      This claim has exceeded the mandated 7-day processing deadline and requires escalation authority intervention.
                    </div>
                  </div>
                )}

                <ClaimTimeline 
                  auditLogs={claims.selectedClaim.auditLogs || []} 
                  sla={claims.selectedClaim.sla} 
                />
              </div>
            );
          })()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
