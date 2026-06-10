import { Menu, Mic, Square, SquarePen } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useChatSession } from "../contexts/ChatSessionContext";
import { usePatientDrawer } from "../contexts/PatientDrawerContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useNewConversation } from "../hooks/useNewConversation";
import { saveClosedChatSession } from "../lib/chatSessionsApi";
import {
  fetchClosing,
  fetchFinalRatingQuestion,
  sendChatMessage,
  type ChatMessage,
  type ChatState,
} from "../lib/chatApi";

const TYPING_SPEED_MS = 15;
const MOBILE_MEDIA = "(max-width: 767px)";

export default function Chat() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { open: openDrawer } = usePatientDrawer();
  const {
    messages,
    history,
    chatState,
    saved,
    setMessages,
    setHistory,
    setChatState,
    nextId,
    markSaved,
    startSessionIfNeeded,
    sessionGeneration,
  } = useChatSession();

  const { startNewConversation, disabled: newConversationDisabled } = useNewConversation();

  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTypingRef = useRef<{ id: number; fullText: string } | null>(null);
  const bootstrappedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const historyRef = useRef(history);
  const chatStateRef = useRef(chatState);
  const savedRef = useRef(saved);
  historyRef.current = history;
  chatStateRef.current = chatState;
  savedRef.current = saved;

  const typeAiMessage = useCallback(
    (fullText: string): Promise<void> =>
      new Promise((resolve) => {
        setIsTyping(true);
        const id = nextId();
        pendingTypingRef.current = { id, fullText };
        setMessages((prev) => [...prev, { id, role: "ai", text: "" }]);

        let i = 0;
        intervalRef.current = setInterval(() => {
          i++;
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, text: fullText.slice(0, i) } : m)),
          );
          if (i >= fullText.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            pendingTypingRef.current = null;
            setIsTyping(false);
            resolve();
          }
        }, TYPING_SPEED_MS);
      }),
    [nextId, setMessages],
  );

  const persistClosedSession = useCallback(
    async (
      finalHistory: ChatMessage[],
      closingReply: string,
      closedState: ChatState,
    ) => {
      if (!user || savedRef.current) return;
      markSaved();
      try {
        await saveClosedChatSession(user.id, finalHistory, closingReply, {
          initial: closedState.distressInitial,
          final: closedState.distressFinal,
        });
      } catch (persistErr) {
        console.error("Error guardando conversación:", persistErr);
        setError("La conversación terminó, pero no pudimos guardar el nudo.");
      }
    },
    [user, markSaved],
  );

  const deliverClosingMessage = useCallback(
    async (history: ChatMessage[], state: ChatState) => {
      const { reply, state: closedState } = await fetchClosing(history, state);
      const finalHistory: ChatMessage[] = [
        ...history,
        { role: "assistant", content: reply },
      ];
      setHistory(finalHistory);
      setChatState(closedState);

      if (closedState.phase === "closed") {
        await persistClosedSession(finalHistory, reply, closedState);
      }

      await typeAiMessage(reply);
    },
    [persistClosedSession, setHistory, setChatState, typeAiMessage],
  );

  const deliverFinalRatingQuestion = useCallback(
    async (history: ChatMessage[], state: ChatState) => {
      const { reply, state: nextState } = await fetchFinalRatingQuestion(
        history,
        state,
      );
      setHistory([...history, { role: "assistant", content: reply }]);
      setChatState(nextState);
      await typeAiMessage(reply);
    },
    [setHistory, setChatState, typeAiMessage],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const phase = chatStateRef.current.phase;
      if (!trimmed || phase === "closed" || phase === "closing") return;

      setError(null);
      setMessages((prev) => [...prev, { id: nextId(), role: "user", text: trimmed }]);
      setIsTyping(true);

      try {
        const { reply, state } = await sendChatMessage(
          historyRef.current,
          chatStateRef.current,
          trimmed,
        );
        const newHistory: ChatMessage[] = [
          ...historyRef.current,
          { role: "user", content: trimmed },
          { role: "assistant", content: reply },
        ];
        setHistory(newHistory);
        setChatState(state);
        await typeAiMessage(reply);

        if (state.phase === "finalRating" && !state.finalRatingAsked) {
          await deliverFinalRatingQuestion(newHistory, state);
        } else if (state.phase === "closing") {
          await deliverClosingMessage(newHistory, state);
        }
      } catch (e) {
        setIsTyping(false);
        setError(e instanceof Error ? e.message : "Error al enviar el mensaje");
      }
    },
    [
      deliverClosingMessage,
      deliverFinalRatingQuestion,
      nextId,
      setChatState,
      setHistory,
      setMessages,
      typeAiMessage,
    ],
  );

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      void sendMessage(text);
    },
    [sendMessage],
  );

  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput(
    handleVoiceTranscript,
    (msg) => setError(msg),
    {
      notSupported: t("chat.voiceError.notSupported"),
      audioTooShort: t("chat.voiceError.audioTooShort"),
      apiUnavailable: t("chat.voiceError.apiUnavailable"),
    },
  );

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const result = await startSessionIfNeeded();
        if (cancelled) return;

        const pendingWelcome =
          result.kind === "new" ||
          (result.kind === "restored" && result.animateWelcome);
        if (!pendingWelcome) {
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo iniciar el chat");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [startSessionIfNeeded]);

  useEffect(() => {
    if (messages.length > 0) return;

    const first = history[0];
    if (!first || first.role !== "assistant") return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    pendingTypingRef.current = null;

    (async () => {
      try {
        await typeAiMessage(first.content);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo iniciar el chat");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsTyping(false);
      if (pendingTypingRef.current) {
        const { id } = pendingTypingRef.current;
        setMessages((prev) => prev.filter((m) => m.id !== id));
        pendingTypingRef.current = null;
      }
    };
  }, [messages.length, history, sessionGeneration, typeAiMessage, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isTranscribing]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA);
    const syncBodyLock = () => {
      document.body.classList.toggle("chat-mobile-lock", mq.matches);
    };
    syncBodyLock();
    mq.addEventListener("change", syncBodyLock);
    return () => {
      mq.removeEventListener("change", syncBodyLock);
      document.body.classList.remove("chat-mobile-lock");
    };
  }, []);

  const getVoiceBlockReason = (): string | null => {
    if (isTranscribing) return t("chat.voiceHint.transcribing");
    if (chatState.phase === "closing") return t("chat.voiceHint.closing");
    if (chatState.phase === "closed") return t("chat.voiceHint.closed");
    if (isTyping) return t("chat.voiceHint.waitTyping");
    return null;
  };

  const handleMicClick = async () => {
    const blockReason = getVoiceBlockReason();
    if (blockReason) {
      setError(blockReason);
      return;
    }
    setError(null);
    try {
      await toggleRecording();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo usar el micrófono");
    }
  };

  const handleNewConversation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pendingTypingRef.current = null;
    void startNewConversation();
  };

  const isClosed = chatState.phase === "closed";
  const isClosing = chatState.phase === "closing";
  const voiceBlocked = isTyping || isTranscribing || isClosed || isClosing;
  const isNewConversationDisabled =
    newConversationDisabled || isTyping || isLoading || isTranscribing;

  const voiceHint = isRecording
    ? t("chat.voiceHint.listening")
    : isTranscribing
      ? t("chat.voiceHint.transcribing")
      : isClosing
        ? t("chat.voiceHint.closing")
        : isClosed
          ? t("chat.voiceHint.closed")
          : isTyping
            ? t("chat.voiceHint.waitTyping")
            : t("chat.voiceHint.tapToSpeak");

  return (
    <div className="max-md:fixed max-md:inset-0 max-md:h-dvh max-md:w-screen max-md:z-30 max-md:overflow-hidden max-md:overscroll-none md:relative md:flex md:flex-col md:flex-1 md:min-h-[calc(100vh-12rem)]">
      <div className="flex flex-col max-md:h-full md:flex-1 md:min-h-0 max-md:rounded-none max-md:border-0 max-md:shadow-none bg-white/90 md:border md:border-[#C8DAE8] md:rounded-[2rem] md:shadow-xl md:shadow-[#7EB8DA]/10 overflow-hidden">
        <header className="shrink-0 h-14 flex items-center border-b border-[#C8DAE8]/80 bg-[#EEF6FC]/60">
          <div className="md:hidden w-full h-full flex items-center px-3 gap-2">
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Abrir menú"
              className="shrink-0 p-2 rounded-xl text-[#5A7080] hover:text-[#2A3540] hover:bg-white/70 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-center text-sm font-semibold text-[#2A3540] tracking-tight leading-tight min-w-0">
              <span className="font-serif italic text-[#7EB8DA]">Conversación</span>
            </h1>
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={isNewConversationDisabled}
              aria-label={t("chat.newConversation")}
              title={t("chat.newConversation")}
              className="shrink-0 p-2 rounded-xl text-[#5A7080] hover:text-[#2A3540] hover:bg-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SquarePen className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden md:flex w-full h-full items-center px-5 gap-2">
            <div className="w-10 shrink-0" aria-hidden="true" />
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <h1 className="text-center text-sm font-semibold text-[#2A3540] tracking-tight">
                <span className="font-serif italic text-[#7EB8DA]">Conversación</span>
              </h1>
              <p className="text-center text-[10px] text-[#5A7080] mt-0.5">
                Un espacio seguro para desahogarte
              </p>
            </div>
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={isNewConversationDisabled}
              aria-label={t("chat.newConversation")}
              title={t("chat.newConversation")}
              className="shrink-0 p-2 rounded-xl text-[#5A7080] hover:text-[#2A3540] hover:bg-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SquarePen className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-scroll p-4 md:p-5 flex flex-col gap-4">
          {isLoading && messages.length === 0 && (
            <p className="text-center text-sm text-[#5A7080] animate-pulse py-8">
              {t("chat.preparing")}
            </p>
          )}

          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1;
            const showCaret = m.role === "ai" && isLast && isTyping;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  m.role === "ai"
                    ? "bg-[#EEF6FC] border border-[#DDEAF5] rounded-[1.5rem] rounded-tl-sm p-4 md:p-5 text-sm text-[#3D4F5C] shadow-sm max-w-[85%] leading-relaxed whitespace-pre-line"
                    : "bg-gradient-to-br from-[#7EB8DA] to-[#5A9BC4] text-white rounded-[1.5rem] rounded-tr-sm p-4 md:p-5 text-sm shadow-md max-w-[85%] self-end leading-relaxed whitespace-pre-line"
                }
              >
                {m.text}
                {showCaret && (
                  <span className="inline-block w-[2px] h-4 bg-current ml-0.5 align-middle animate-pulse" />
                )}
              </motion.div>
            );
          })}

          {isTranscribing && (
            <p className="text-center text-xs text-[#5A7080] animate-pulse">
              {t("chat.transcribing")}
            </p>
          )}

          {error && (
            <p className="text-center text-xs text-red-600/80 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 bg-[#EEF6FC]/40 border-t border-[#C8DAE8]/80 px-4 py-6 max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col items-center gap-4">
            <p
              className={`text-sm text-center transition-colors ${
                isRecording
                  ? "text-red-600 font-medium"
                  : isTranscribing
                    ? "text-[#5A7080] animate-pulse"
                    : "text-[#5A7080]"
              }`}
            >
              {voiceHint}
            </p>

            <div className="relative flex items-center justify-center">
              {isRecording && (
                <span
                  className="absolute inset-0 m-auto w-24 h-24 md:w-28 md:h-28 rounded-full bg-red-400/30 animate-ping"
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                onClick={() => void handleMicClick()}
                aria-disabled={voiceBlocked && !isRecording}
                aria-label={isRecording ? "Detener grabación y enviar" : "Pulsa para hablar"}
                className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  voiceBlocked && !isRecording
                    ? "opacity-50 cursor-not-allowed shadow-none"
                    : ""
                } ${
                  isRecording
                    ? "bg-red-500 text-white shadow-red-500/30 scale-105"
                    : "bg-gradient-to-br from-[#7EB8DA] to-[#5A9BC4] text-white shadow-[#7EB8DA]/30 hover:scale-105 active:scale-95"
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 md:w-9 md:h-9 fill-current" />
                ) : (
                  <Mic className="w-9 h-9 md:w-10 md:h-10" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
