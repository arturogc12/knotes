import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PatientDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const PatientDrawerContext = createContext<PatientDrawerContextValue | null>(null);

export function PatientDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <PatientDrawerContext.Provider value={value}>{children}</PatientDrawerContext.Provider>
  );
}

export function usePatientDrawer() {
  const context = useContext(PatientDrawerContext);
  if (!context) {
    throw new Error("usePatientDrawer must be used within PatientDrawerProvider");
  }
  return context;
}
