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
import { useAuth } from "./AuthContext";
import {
  fetchWelcome,
  INITIAL_CHAT_STATE,
  type ChatMessage,
  type ChatState,
} from "../lib/chatApi";

export interface UiMessage {
  id: number;
  role: "ai" | "user";
  text: string;
}

interface StoredChatSession {
  messages: UiMessage[];
  history: ChatMessage[];
  chatState: ChatState;
  nextMessageId: number;
  saved: boolean;
  initialized: boolean;
  generation: number;
}

type StartSessionResult =
  | { kind: "restored"; animateWelcome: boolean }
  | { kind: "new"; reply: string; state: ChatState };

type ChatSessionContextValue = {
  messages: UiMessage[];
  history: ChatMessage[];
  chatState: ChatState;
  saved: boolean;
  setMessages: (
    updater: UiMessage[] | ((prev: UiMessage[]) => UiMessage[]),
  ) => void;
  setHistory: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void;
  setChatState: (updater: ChatState | ((prev: ChatState) => ChatState)) => void;
  nextId: () => number;
  markSaved: () => void;
  startSessionIfNeeded: () => Promise<StartSessionResult>;
  resetSession: () => Promise<{ reply: string; state: ChatState }>;
  sessionGeneration: number;
};

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

const STORAGE_DEBOUNCE_MS = 450;

function storageKey(userId: string) {
  return `knotes:chat-session:${userId}`;
}

function emptySession(): StoredChatSession {
  return {
    messages: [],
    history: [],
    chatState: INITIAL_CHAT_STATE,
    nextMessageId: 0,
    saved: false,
    initialized: false,
    generation: 0,
  };
}

function shouldAnimateWelcome(session: StoredChatSession): boolean {
  return (
    session.messages.length === 0 &&
    session.history.length === 1 &&
    session.history[0]?.role === "assistant"
  );
}

function loadFromStorage(userId: string): StoredChatSession | null {
  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChatSession;
    if (!parsed.initialized) return null;
    return { ...parsed, generation: parsed.generation ?? 0 };
  } catch {
    return null;
  }
}

function saveToStorage(userId: string, session: StoredChatSession) {
  sessionStorage.setItem(storageKey(userId), JSON.stringify(session));
}

function clearStorage(userId: string) {
  sessionStorage.removeItem(storageKey(userId));
}

function ensureUiMessages(session: StoredChatSession): StoredChatSession {
  if (session.messages.length > 0 || session.history.length === 0) {
    return session;
  }

  if (shouldAnimateWelcome(session)) {
    return session;
  }

  let id = 0;
  const messages: UiMessage[] = session.history.map((m) => ({
    id: ++id,
    role: m.role === "assistant" ? "ai" : "user",
    text: m.content,
  }));

  return { ...session, messages, nextMessageId: id };
}

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [session, setSession] = useState<StoredChatSession>(emptySession);
  const nextIdRef = useRef(0);
  const startingRef = useRef(false);
  const prevUserIdRef = useRef<string | null>(null);
  const sessionSnapshotRef = useRef(session);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveImmediateRef = useRef(false);

  sessionSnapshotRef.current = session;

  useEffect(() => {
    if (prevUserIdRef.current && !userId) {
      clearStorage(prevUserIdRef.current);
    }
    prevUserIdRef.current = userId;

    if (!userId) {
      setSession(emptySession());
      nextIdRef.current = 0;
      return;
    }

    const stored = loadFromStorage(userId);
    if (stored) {
      const restored = ensureUiMessages(stored);
      setSession(restored);
      nextIdRef.current = restored.nextMessageId;
    } else {
      setSession(emptySession());
      nextIdRef.current = 0;
    }
  }, [userId]);

  const flushSave = useCallback(() => {
    if (!userId || !sessionSnapshotRef.current.initialized) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    saveToStorage(userId, sessionSnapshotRef.current);
  }, [userId]);

  const scheduleSave = useCallback(
    (immediate = false) => {
      if (!userId || !sessionSnapshotRef.current.initialized) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (immediate) {
        saveToStorage(userId, sessionSnapshotRef.current);
        saveTimerRef.current = null;
        return;
      }
      saveTimerRef.current = setTimeout(() => {
        saveToStorage(userId, sessionSnapshotRef.current);
        saveTimerRef.current = null;
      }, STORAGE_DEBOUNCE_MS);
    },
    [userId],
  );

  useEffect(() => {
    if (!userId || !session.initialized) return;
    const immediate = saveImmediateRef.current;
    saveImmediateRef.current = false;
    scheduleSave(immediate);
  }, [userId, session, scheduleSave]);

  useEffect(() => {
    const onPageHide = () => flushSave();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [flushSave]);

  const setMessages = useCallback(
    (updater: UiMessage[] | ((prev: UiMessage[]) => UiMessage[])) => {
      setSession((prev) => ({
        ...prev,
        initialized: true,
        messages: typeof updater === "function" ? updater(prev.messages) : updater,
      }));
    },
    [],
  );

  const setHistory = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      saveImmediateRef.current = true;
      setSession((prev) => ({
        ...prev,
        initialized: true,
        history: typeof updater === "function" ? updater(prev.history) : updater,
      }));
    },
    [],
  );

  const setChatState = useCallback(
    (updater: ChatState | ((prev: ChatState) => ChatState)) => {
      saveImmediateRef.current = true;
      setSession((prev) => ({
        ...prev,
        initialized: true,
        chatState: typeof updater === "function" ? updater(prev.chatState) : updater,
      }));
    },
    [],
  );

  const nextId = useCallback(() => {
    const id = ++nextIdRef.current;
    setSession((prev) => ({ ...prev, nextMessageId: nextIdRef.current }));
    return id;
  }, []);

  const markSaved = useCallback(() => {
    saveImmediateRef.current = true;
    setSession((prev) => ({ ...prev, saved: true }));
  }, []);

  const startSessionIfNeeded = useCallback(async (): Promise<StartSessionResult> => {
    if (!userId) {
      throw new Error("No hay sesión de usuario");
    }

    if (session.initialized && session.history.length > 0) {
      return { kind: "restored", animateWelcome: shouldAnimateWelcome(session) };
    }

    const stored = loadFromStorage(userId);
    if (stored?.initialized && stored.history.length > 0) {
      const restored = ensureUiMessages(stored);
      setSession(restored);
      nextIdRef.current = restored.nextMessageId;
      return { kind: "restored", animateWelcome: shouldAnimateWelcome(restored) };
    }

    if (startingRef.current) {
      return { kind: "restored", animateWelcome: false };
    }

    startingRef.current = true;
    try {
      const { reply, state } = await fetchWelcome();
      saveImmediateRef.current = true;
      setSession({
        messages: [],
        history: [{ role: "assistant", content: reply }],
        chatState: state,
        nextMessageId: 0,
        saved: false,
        initialized: true,
        generation: session.generation,
      });
      nextIdRef.current = 0;
      return { kind: "new", reply, state };
    } finally {
      startingRef.current = false;
    }
  }, [userId, session.initialized, session.history.length, session.generation]);

  const resetSession = useCallback(async () => {
    if (!userId) {
      throw new Error("No hay sesión de usuario");
    }

    clearStorage(userId);
    nextIdRef.current = 0;
    startingRef.current = false;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;

    const { reply, state } = await fetchWelcome();
    saveImmediateRef.current = true;
    setSession((prev) => ({
      messages: [],
      history: [{ role: "assistant", content: reply }],
      chatState: state,
      nextMessageId: 0,
      saved: false,
      initialized: true,
      generation: prev.generation + 1,
    }));

    return { reply, state };
  }, [userId]);

  const value = useMemo(
    () => ({
      messages: session.messages,
      history: session.history,
      chatState: session.chatState,
      saved: session.saved,
      setMessages,
      setHistory,
      setChatState,
      nextId,
      markSaved,
      startSessionIfNeeded,
      resetSession,
      sessionGeneration: session.generation,
    }),
    [
      session.messages,
      session.history,
      session.chatState,
      session.saved,
      session.generation,
      setMessages,
      setHistory,
      setChatState,
      nextId,
      markSaved,
      startSessionIfNeeded,
      resetSession,
    ],
  );

  return (
    <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>
  );
}

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error("useChatSession must be used within ChatSessionProvider");
  }
  return context;
}
