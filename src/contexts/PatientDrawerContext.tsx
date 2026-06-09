import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type CloseOptions = {
  fromPopState?: boolean;
  skipHistory?: boolean;
};

type PatientDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: (options?: CloseOptions) => void;
  toggle: () => void;
};

const PatientDrawerContext = createContext<PatientDrawerContextValue | null>(null);

export function PatientDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const historyPushedRef = useRef(false);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!historyPushedRef.current) {
      window.history.pushState({ knotesDrawer: true }, "");
      historyPushedRef.current = true;
    }
  }, []);

  const close = useCallback((options?: CloseOptions) => {
    setIsOpen(false);

    if (!historyPushedRef.current) return;

    if (options?.fromPopState || options?.skipHistory) {
      historyPushedRef.current = false;
      return;
    }

    historyPushedRef.current = false;
    window.history.back();
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  useEffect(() => {
    const onPopState = () => {
      setIsOpen((open) => {
        if (!open) return open;
        historyPushedRef.current = false;
        return false;
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
