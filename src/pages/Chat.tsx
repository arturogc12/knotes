import { Menu, Mic, MicOff, Send } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePatientDrawer } from "../contexts/PatientDrawerContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { saveClosedChatSession } from "../lib/chatSessionsApi";
import {
  fetchWelcome,
  INITIAL_CHAT_STATE,
  sendChatMessage,
  type ChatMessage,
  type ChatState,
} from "../lib/chatApi";

const TYPING_SPEED_MS = 25;
const MOBILE_MEDIA = "(max-width: 767px)";

interface UiMessage {
  id: number;
  role: "ai" | "user";
  text: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { open: openDrawer } = usePatientDrawer();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [chatState, setChatState] = useState<ChatState>(INITIAL_CHAT_STATE);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const savedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const historyRef = useRef(history);
  const chatStateRef = useRef(chatState);
  historyRef.current = history;
  chatStateRef.current = chatState;

  const nextId = () => ++idRef.current;

  const typeAiMessage = (fullText: string): Promise<void> =>
    new Promise((resolve) => {
      setIsTyping(true);
      const id = nextId();
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
          setIsTyping(false);
          resolve();
        }
      }, TYPING_SPEED_MS);
    });

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatStateRef.current.phase === "closed") return;

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

      if (state.phase === "closed" && user && !savedRef.current) {
        savedRef.current = true;
        try {
          await saveClosedChatSession(user.id, newHistory, reply);
        } catch (persistErr) {
          console.error("Error guardando conversación:", persistErr);
          setError("La conversación terminó, pero no pudimos guardar el nudo.");
        }
      }
    } catch (e) {
      setIsTyping(false);
      setError(e instanceof Error ? e.message : "Error al enviar el mensaje");
    }
  }, [user]);

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      void sendMessage(text);
    },
    [sendMessage],
  );

  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput(
    handleVoiceTranscript,
    (msg) => setError(msg),
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const { reply, state } = await fetchWelcome();
        setChatState(state);
        setHistory([{ role: "assistant", content: reply }]);
        await typeAiMessage(reply);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo iniciar el chat");
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping || isLoading || isTranscribing || chatState.phase === "closed") return;
    setInput("");
    void sendMessage(text);
  };

  const handleMicClick = async () => {
    if (isTyping || isLoading || isTranscribing || chatState.phase === "closed") return;
    try {
      await toggleRecording();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo usar el micrófono");
    }
  };

  const isClosed = chatState.phase === "closed";
  const inputDisabled = isTyping || isLoading || isTranscribing || isClosed;

  return (
    <div className="max-md:fixed max-md:inset-0 max-md:h-dvh max-md:w-screen max-md:z-30 max-md:overflow-hidden max-md:overscroll-none md:relative md:flex md:flex-col md:flex-1 md:min-h-[calc(100vh-12rem)]">
      <div className="flex flex-col max-md:h-full md:flex-1 md:min-h-0 max-md:rounded-none max-md:border-0 max-md:shadow-none bg-white/90 md:border md:border-[#E8D8CC] md:rounded-[2rem] md:shadow-xl md:shadow-[#C17B5C]/10 overflow-hidden">
        <header className="shrink-0 h-14 flex items-center border-b border-[#E8D8CC]/80 bg-[#FFF6F0]/60">
          <div className="md:hidden w-full h-full flex items-center px-3 gap-3">
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Abrir menú"
              className="shrink-0 p-2 rounded-xl text-[#5D6D66] hover:text-[#2D2D2D] hover:bg-white/70 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-center text-sm font-semibold text-[#2D2D2D] tracking-tight leading-tight">
              <span className="font-serif italic text-[#C17B5C]">Conversación</span>
            </h1>
            <div className="w-9 shrink-0" aria-hidden="true" />
          </div>

          <div className="hidden md:flex w-full flex-col items-center justify-center px-5 py-4">
            <h1 className="text-center text-sm font-semibold text-[#2D2D2D] tracking-tight">
              <span className="font-serif italic text-[#C17B5C]">Conversación</span>
            </h1>
            <p className="text-center text-[10px] text-[#5D6D66] mt-0.5">
              Un espacio seguro para desahogarte
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-scroll p-4 md:p-5 flex flex-col gap-4">
          {isLoading && messages.length === 0 && (
            <p className="text-center text-sm text-[#5D6D66] animate-pulse py-8">
              Preparando tu espacio seguro...
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
                    ? "bg-[#FFF6F0] border border-[#F0E4D8] rounded-[1.5rem] rounded-tl-sm p-4 md:p-5 text-sm text-[#4A4A4A] shadow-sm max-w-[85%] leading-relaxed whitespace-pre-line"
                    : "bg-gradient-to-br from-[#C17B5C] to-[#A86548] text-white rounded-[1.5rem] rounded-tr-sm p-4 md:p-5 text-sm shadow-md max-w-[85%] self-end leading-relaxed whitespace-pre-line"
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
            <p className="text-center text-xs text-[#5D6D66] animate-pulse">
              Transcribiendo con ChatGPT...
            </p>
          )}

          {error && (
            <p className="text-center text-xs text-red-600/80 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 bg-[#FFF6F0]/40 border-t border-[#E8D8CC]/80 p-4 max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleMicClick()}
              disabled={inputDisabled}
              aria-label={isRecording ? "Detener grabación" : "Hablar con el chat"}
              className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-[#F2E8DE] text-[#4A4A4A] hover:bg-[#E0D0C4]"
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSend();
                }}
                disabled={inputDisabled}
                placeholder={
                  isRecording
                    ? "Escuchando... pulsa el micrófono para terminar"
                    : isClosed
                      ? "La conversación ha terminado."
                      : "Escribe o habla lo que piensas..."
                }
                className="w-full bg-[#F7F5F2] border border-[#E8D8CC] rounded-full pl-5 pr-12 py-3.5 text-[16px] md:text-sm focus:outline-none focus:bg-white focus:border-[#C17B5C] focus:ring-1 focus:ring-[#C17B5C] transition-all placeholder-[#5D6D66]/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => void handleSend()}
                disabled={inputDisabled || !input.trim()}
                aria-label="Enviar"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#C17B5C] rounded-full flex items-center justify-center text-white hover:bg-[#A86548] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
