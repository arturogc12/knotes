import { Menu, Mic, Square, SquarePen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageBubble } from "../components/chat/MessageBubble";
import { useAuth } from "../contexts/AuthContext";
import { useChatSession } from "../contexts/ChatSessionContext";
import { usePatientDrawer } from "../contexts/PatientDrawerContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useNewConversation } from "../hooks/useNewConversation";
import {
  ensureDraftChatSession,
  ensureDraftNudo,
  finalizeClosedSession,
  syncDraftNudoFromMessages,
} from "../lib/chatSessionsApi";
import { TYPING_MS_PER_CHAR } from "../lib/chatTypewriter";
import {
  fetchClosing,
  fetchFinalRatingQuestion,
  sendChatMessage,
  type ChatMessage,
  type ChatState,
} from "../lib/chatApi";
const MOBILE_MEDIA = "(max-width: 767px)";
const SCROLL_NEAR_BOTTOM_THRESHOLD = 80;
const ABC_PENDING_NOTE =
  "\n\nTu nudo queda guardado. El análisis A-B-C se completará automáticamente al revisarlo en Mis Nudos o al generar tu informe.";

export default function Chat() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { open: openDrawer } = usePatientDrawer();
  const {
    messages,
    history,
    chatState,
    saved,
    chatSessionId,
    nudoId,
    setMessages,
    setHistory,
    setChatState,
    setPersistenceIds,
    nextId,
    markSaved,
    startSessionIfNeeded,
    sessionGeneration,
  } = useChatSession();

  const { startNewConversation, disabled: newConversationDisabled } = useNewConversation();

  const [isTyping, setIsTyping] = useState(false);
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScrollHeightRef = useRef(0);
  const pendingTypingRef = useRef<{ id: number; fullText: string } | null>(null);
  const bootstrappedRef = useRef(false);
  const welcomeStartedRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastBubbleRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const restoredScrollDoneRef = useRef(false);
  const scrollPendingRef = useRef(false);

  const historyRef = useRef(history);
  const chatStateRef = useRef(chatState);
  const savedRef = useRef(saved);
  const chatSessionIdRef = useRef(chatSessionId);
  const nudoIdRef = useRef(nudoId);
  historyRef.current = history;
  chatStateRef.current = chatState;
  savedRef.current = saved;
  chatSessionIdRef.current = chatSessionId;
  nudoIdRef.current = nudoId;

  const stickToBottom = useCallback(() => {
    shouldAutoScrollRef.current = true;
  }, []);

  const applyScrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto", instant = false) => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const target = el.scrollHeight;
      const atBottom = el.scrollTop + el.clientHeight >= target - 4;

      if (instant && atBottom && target === lastScrollHeightRef.current) return;

      lastScrollHeightRef.current = target;

      const useInstant =
        instant || behavior === "auto" || window.matchMedia(MOBILE_MEDIA).matches;

      if (useInstant) {
        el.scrollTop = target;
        return;
      }

      el.scrollTo({ top: target, behavior });
    },
    [],
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      applyScrollToBottom(behavior);
    },
    [applyScrollToBottom],
  );

  const scheduleScrollToBottom = useCallback(() => {
    if (!shouldAutoScrollRef.current) return;
    if (scrollPendingRef.current) return;
    scrollPendingRef.current = true;
    requestAnimationFrame(() => {
      scrollPendingRef.current = false;
      if (!shouldAutoScrollRef.current) return;
      applyScrollToBottom("auto", true);
    });
  }, [applyScrollToBottom]);

  const maybeScrollToBottom = useCallback(() => {
    if (!shouldAutoScrollRef.current) return;
    scheduleScrollToBottom();
  }, [scheduleScrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distance < SCROLL_NEAR_BOTTOM_THRESHOLD;
  }, []);

  const flushScroll = useCallback(
    (behavior: ScrollBehavior = "auto") =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          scrollToBottom(behavior);
          requestAnimationFrame(() => resolve());
        });
      }),
    [scrollToBottom],
  );

  const clearTypingTimer = useCallback(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = null;
  }, []);

  const typeAiMessage = useCallback(
    async (fullText: string, existingId?: number): Promise<void> => {
      setIsAwaitingReply(false);
      setIsTyping(true);
      stickToBottom();
      lastScrollHeightRef.current = 0;

      const id = existingId ?? nextId();
      pendingTypingRef.current = { id, fullText };

      if (existingId === undefined) {
        setMessages((prev) => [...prev, { id, role: "ai", text: "" }]);
      }

      await flushScroll("auto");

      return new Promise((resolve) => {
        if (!fullText.length) {
          pendingTypingRef.current = null;
          setIsTyping(false);
          resolve();
          return;
        }

        let i = 0;
        typingIntervalRef.current = setInterval(() => {
          i++;
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, text: fullText.slice(0, i) } : m)),
          );
          maybeScrollToBottom();

          if (i >= fullText.length) {
            clearTypingTimer();
            pendingTypingRef.current = null;
            setIsTyping(false);
            lastScrollHeightRef.current = 0;
            maybeScrollToBottom();
            resolve();
          }
        }, TYPING_MS_PER_CHAR);
      });
    },
    [
      nextId,
      setMessages,
      flushScroll,
      stickToBottom,
      maybeScrollToBottom,
      clearTypingTimer,
    ],
  );

  const syncTurnToSupabase = useCallback(
    async (currentHistory: ChatMessage[], currentState: ChatState) => {
      if (!user || savedRef.current) return;

      try {
        const distress = {
          initial: currentState.distressInitial,
          final: currentState.distressFinal,
        };
        const sessionId = await ensureDraftChatSession(
          user.id,
          chatSessionIdRef.current,
          currentHistory,
          currentState.phase,
          distress,
        );
        if (sessionId !== chatSessionIdRef.current) {
          chatSessionIdRef.current = sessionId;
          setPersistenceIds({ chatSessionId: sessionId });
        }

        const hasUserMessage = currentHistory.some((m) => m.role === "user");

        if (hasUserMessage) {
          const nextNudoId = await ensureDraftNudo(
            user.id,
            nudoIdRef.current,
            sessionId,
            currentHistory,
            distress,
          );
          if (nextNudoId !== nudoIdRef.current) {
            nudoIdRef.current = nextNudoId;
            setPersistenceIds({ nudoId: nextNudoId });
          }
        } else if (nudoIdRef.current) {
          await syncDraftNudoFromMessages(nudoIdRef.current, currentHistory, distress);
        }
      } catch (syncErr) {
        console.error("Error sincronizando borrador:", syncErr);
      }
    },
    [user, setPersistenceIds],
  );

  const persistClosedSession = useCallback(
    async (
      finalHistory: ChatMessage[],
      closingReply: string,
      closedState: ChatState,
    ): Promise<"ok" | "abc_pending" | "save_failed" | "already_saved"> => {
      if (!user || savedRef.current) return "already_saved";

      try {
        const { abcExtractionOk } = await finalizeClosedSession(
          user.id,
          {
            chatSessionId: chatSessionIdRef.current,
            nudoId: nudoIdRef.current,
          },
          finalHistory,
          closingReply,
          {
            initial: closedState.distressInitial,
            final: closedState.distressFinal,
          },
        );
        markSaved();
        return abcExtractionOk ? "ok" : "abc_pending";
      } catch (persistErr) {
        console.error("Error guardando conversación:", persistErr);
        setError("La conversación terminó, pero no pudimos guardar el nudo.");
        return "save_failed";
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

      let replyToShow = reply;
      if (closedState.phase === "closed") {
        const persistResult = await persistClosedSession(
          finalHistory,
          reply,
          closedState,
        );
        if (persistResult === "abc_pending") {
          replyToShow = `${reply}${ABC_PENDING_NOTE}`;
        }
      }

      await typeAiMessage(replyToShow);
    },
    [persistClosedSession, setHistory, setChatState, typeAiMessage],
  );

  const deliverFinalRatingQuestion = useCallback(
    async (history: ChatMessage[], state: ChatState) => {
      const { reply, state: nextState } = await fetchFinalRatingQuestion(
        history,
        state,
      );
      const newHistory = [...history, { role: "assistant", content: reply }];
      setHistory(newHistory);
      setChatState(nextState);
      await typeAiMessage(reply);
      await syncTurnToSupabase(newHistory, nextState);
    },
    [setHistory, setChatState, typeAiMessage, syncTurnToSupabase],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const phase = chatStateRef.current.phase;
      if (!trimmed || phase === "closed" || phase === "closing") return;

      setError(null);
      stickToBottom();
      const userMessageId = nextId();
      const thinkingId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", text: trimmed },
        { id: thinkingId, role: "ai", text: "" },
      ]);
      setIsAwaitingReply(true);

      const isMobile = window.matchMedia(MOBILE_MEDIA).matches;
      await flushScroll(isMobile ? "auto" : "smooth");

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
        await typeAiMessage(reply, thinkingId);
        await syncTurnToSupabase(newHistory, state);

        if (state.phase === "finalRating" && !state.finalRatingAsked) {
          await deliverFinalRatingQuestion(newHistory, state);
        } else if (state.phase === "closing") {
          await deliverClosingMessage(newHistory, state);
        }
      } catch (e) {
        setIsAwaitingReply(false);
        setIsTyping(false);
        setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
        setError(e instanceof Error ? e.message : "Error al enviar el mensaje");
      }
    },
    [
      deliverClosingMessage,
      deliverFinalRatingQuestion,
      syncTurnToSupabase,
      nextId,
      setChatState,
      setHistory,
      setMessages,
      typeAiMessage,
      flushScroll,
      stickToBottom,
    ],
  );

  const handleVoiceTranscript = useCallback(
    async (text: string) => {
      await sendMessage(text);
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
      noSpeechDetected: t("chat.voiceError.noSpeechDetected"),
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

  const welcomeContent = history[0]?.content;

  useEffect(() => {
    const welcomeKey = `${sessionGeneration}:${welcomeContent ?? ""}`;

    if (messages.length > 0) {
      welcomeStartedRef.current = welcomeKey;
      return;
    }

    const first = history[0];
    if (!first || first.role !== "assistant") return;

    if (welcomeStartedRef.current === welcomeKey) return;
    welcomeStartedRef.current = welcomeKey;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    clearTypingTimer();
    pendingTypingRef.current = null;

    (async () => {
      try {
        await typeAiMessage(first.content);
        if (user) {
          await syncTurnToSupabase(
            [{ role: "assistant", content: first.content }],
            chatStateRef.current,
          );
        }
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
      clearTypingTimer();
      setIsTyping(false);
      setIsAwaitingReply(false);
      welcomeStartedRef.current = null;
      if (pendingTypingRef.current) {
        const { id } = pendingTypingRef.current;
        setMessages((prev) => prev.filter((m) => m.id !== id));
        pendingTypingRef.current = null;
      }
    };
  }, [
    sessionGeneration,
    welcomeContent,
    typeAiMessage,
    setMessages,
    clearTypingTimer,
    syncTurnToSupabase,
    user,
  ]);

  useEffect(() => {
    restoredScrollDoneRef.current = false;
  }, [sessionGeneration]);

  useEffect(() => {
    if (messages.length === 0 || isTyping || isLoading) return;
    if (restoredScrollDoneRef.current) return;
    restoredScrollDoneRef.current = true;
    stickToBottom();
    void flushScroll("auto");
  }, [messages.length, isTyping, isLoading, stickToBottom, flushScroll]);

  useEffect(() => {
    if (isTyping || isAwaitingReply) return;
    const el = lastBubbleRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      scheduleScrollToBottom();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [messages.length, isTyping, isAwaitingReply, scheduleScrollToBottom]);

  useEffect(() => {
    stickToBottom();
    scrollToBottom("auto");
  }, [isRecording, isTranscribing, stickToBottom, scrollToBottom]);

  const isClosed = chatState.phase === "closed";
  const isClosing = chatState.phase === "closing";
  const voiceBlocked =
    isTyping || isAwaitingReply || isTranscribing || isClosed || isClosing;
  const isNewConversationDisabled =
    newConversationDisabled ||
    isTyping ||
    isAwaitingReply ||
    isLoading ||
    isTranscribing;

  const footerStatus = error
    ? error
    : isRecording
      ? t("chat.voiceHint.listening")
      : isTranscribing
        ? t("chat.voiceHint.transcribing")
        : isClosing
          ? t("chat.voiceHint.closing")
          : isClosed
            ? t("chat.voiceHint.closed")
            : null;

  const showFooterStatus = footerStatus !== null;

  const handleMicClick = async () => {
    if (voiceBlocked && !isRecording) return;
    setError(null);
    try {
      await toggleRecording();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo usar el micrófono");
    }
  };

  const handleNewConversation = () => {
    clearTypingTimer();
    pendingTypingRef.current = null;
    setIsAwaitingReply(false);
    void startNewConversation();
  };

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

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-scroll [overflow-anchor:none] p-4 md:p-5 max-md:pb-2 max-md:scroll-pb-28 flex flex-col gap-4"
        >
          {isLoading && messages.length === 0 && (
            <p className="text-center text-sm text-[#5A7080] animate-pulse py-8">
              {t("chat.preparing")}
            </p>
          )}

          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1;
            const isThinking =
              isAwaitingReply && m.role === "ai" && isLast && m.text === "";
            const showCaret = m.role === "ai" && isLast && isTyping && !isThinking;
            return (
              <div
                key={m.id}
                ref={isLast ? lastBubbleRef : undefined}
                className={m.role === "user" ? "self-end" : undefined}
              >
                <MessageBubble
                  role={m.role}
                  text={m.text}
                  showCaret={showCaret}
                  isThinking={isThinking}
                />
              </div>
            );
          })}

          <div ref={bottomRef} aria-hidden="true" className="shrink-0 h-px" />
        </div>

        <div className="shrink-0 relative z-10 max-md:bg-[#EEF6FC] md:bg-[#EEF6FC]/40 border-t border-[#C8DAE8]/80 px-4 py-6 max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="grid grid-rows-[auto_auto] justify-items-center gap-3">
            <div
              className={`w-full max-w-sm ${
                showFooterStatus ? "min-h-11 max-h-[3.25rem]" : "h-0 overflow-hidden"
              }`}
            >
              {showFooterStatus && (
                <p
                  key={footerStatus}
                  className={`text-sm text-center px-3 leading-snug line-clamp-2 ${
                    error
                      ? "text-red-600 font-medium"
                      : isRecording
                        ? "text-red-600 font-medium"
                        : "text-[#5A7080]"
                  }`}
                >
                  {footerStatus}
                </p>
              )}
            </div>

            <div className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
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
