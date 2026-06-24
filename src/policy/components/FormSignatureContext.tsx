// Stub for removed FormSignatureContext (designless baseline)
// Provides minimal types and hooks to prevent import errors and white screen.
// Real implementation was in design source but pruned.

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FormSignature {
  id: string;
  formId: string;
  signer: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: string;
}

interface FormSignatureContextType {
  signatures: Map<string, FormSignature>;
  requestSign: (formId: string, signer: string) => void;
  sign: (formId: string, signer: string) => void;
}

const FormSignatureContext = createContext<FormSignatureContextType | null>(null);

export function FormSignatureProvider({ children }: { children: ReactNode }) {
  const [signatures, setSignatures] = useState(new Map<string, FormSignature>());

  const requestSign = (formId: string, signer: string) => {
    setSignatures(prev => {
      const next = new Map(prev);
      next.set(formId, { id: formId, formId, signer, status: 'pending' });
      return next;
    });
  };

  const sign = (formId: string, signer: string) => {
    setSignatures(prev => {
      const next = new Map(prev);
      const existing = next.get(formId);
      if (existing) {
        next.set(formId, { ...existing, status: 'signed', signedAt: new Date().toISOString() });
      }
      return next;
    });
  };

  return (
    <FormSignatureContext.Provider value={{ signatures, requestSign, sign }}>
      {children}
    </FormSignatureContext.Provider>
  );
}

export function useFormSignatureContext() {
  const context = useContext(FormSignatureContext);
  if (!context) {
    // Fallback for places without provider
    return {
      signatures: new Map(),
      requestSign: () => {},
      sign: () => {},
    };
  }
  return context;
}

// For legacy imports in scripts/tests
export const DEMO_STAFF = [];
