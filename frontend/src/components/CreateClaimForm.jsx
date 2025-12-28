import { useState } from 'react';
import { createClaim } from '../services/claimsService';

function CreateClaimForm({ currentRole, onClaimCreated }) {
  const [department, setDepartment] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (currentRole !== 'Student') {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!department || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createClaim({
        studentId: 'demo-student',
        department,
        amount: parseFloat(amount)
      });

      setDepartment('');
      setAmount('');
      
      if (onClaimCreated) {
        await onClaimCreated();
      }
    } catch (err) {
      setError(err.message || 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px', marginBottom: '15px' }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>Submit Reimbursement Claim</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Department:
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="e.g., Computer Science"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Amount:
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="0.00"
          />
        </div>

        {error && (
          <div style={{ 
            padding: '8px', 
            marginBottom: '15px', 
            backgroundColor: '#ffebee', 
            border: '1px solid #d32f2f', 
            borderRadius: '4px', 
            color: '#c62828',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#2196f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Reimbursement Claim'}
        </button>
      </form>
    </div>
  );
}

export default CreateClaimForm;
