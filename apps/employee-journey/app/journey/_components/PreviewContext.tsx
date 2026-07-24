"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_PERSONA_ID,
  getPersona,
  type Persona,
  type PersonaId,
} from "../_data/fixtures";

type PreviewContextValue = {
  persona: Persona;
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  withPersona: (href: string) => string;
  liveMessage: string;
  announce: (message?: string) => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedPersona = searchParams.get("persona") ?? DEFAULT_PERSONA_ID;
  const persona = getPersona(requestedPersona);
  const [liveMessage, setLiveMessage] = useState("");

  const setPersonaId = useCallback(
    (id: PersonaId) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("persona", id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      setLiveMessage("Synthetic persona changed. No official employee record is shown.");
    },
    [pathname, router, searchParams],
  );

  const withPersona = useCallback(
    (href: string) => {
      const separator = href.includes("?") ? "&" : "?";
      return `${href}${separator}persona=${persona.id}`;
    },
    [persona.id],
  );

  const announce = useCallback((message?: string) => {
    setLiveMessage("");
    window.setTimeout(
      () =>
        setLiveMessage(
          message ?? "Preview opened. No official record was changed.",
        ),
      10,
    );
  }, []);

  const value = useMemo(
    () => ({
      persona,
      personaId: persona.id,
      setPersonaId,
      withPersona,
      liveMessage,
      announce,
    }),
    [announce, liveMessage, persona, setPersonaId, withPersona],
  );

  return (
    <PreviewContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreview must be used inside PreviewProvider");
  }
  return context;
}

