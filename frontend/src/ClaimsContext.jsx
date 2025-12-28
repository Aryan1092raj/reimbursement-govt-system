import { createContext, useState, useContext } from 'react';

const ClaimsContext = createContext();

export function ClaimsProvider({ children }) {
  const [claimsState, setClaimsState] = useState({
    list: [],
    selectedClaimId: null,
    selectedClaim: null,
    loading: false,
    error: null,
    loadingDetail: false,
    errorDetail: null
  });

  const state = { claims: claimsState };

  if (import.meta.env.DEV) {
    window.__STATE__ = state;
  }

  return (
    <ClaimsContext.Provider value={{ 
      state,
      setClaimsState
    }}>
      {children}
    </ClaimsContext.Provider>
  );
}

export function useClaims() {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error('useClaims must be used within ClaimsProvider');
  }
  return context;
}
