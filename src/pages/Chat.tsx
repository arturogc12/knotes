import { ArrowLeft, Mic, MicOff, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import {
  fetchWelcome,
  INITIAL_CHAT_STATE,
  sendChatMessage,
  type ChatMessage,
  type ChatState,
} from "../lib/chatApi";

const TYPING_SPEED_MS = 25;

interface UiMessage {
  id: number;
  role: "ai" | "user";
  text: string;
}

export default function Chat() {
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
    } catch (e) {
      setIsTyping(false);
      setError(e instanceof Error ? e.message : "Error al enviar el mensaje");
    }
  }, []);

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
    <div className="h-screen bg-[#F7F5F2] flex flex-col font-sans selection:bg-[#8DA399]/20">
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E8E4DF] flex items-center justify-between px-4 py-4 shrink-0">
        <Link to="/" className="text-[#4A4A4A] hover:text-[#2D2D2D] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-[#8DA399] rounded flex items-center justify-center mb-1">
            <span className="text-white font-serif italic text-xs font-bold -mt-0.5">K</span>
          </div>
          <h1 className="text-sm font-semibold text-[#2D2D2D] tracking-tight">Tu Lienzo</h1>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <div className="flex justify-center my-6">
          <span className="text-[10px] font-bold tracking-widest text-[#5D6D66] uppercase bg-white border border-[#E8E4DF] px-4 py-1.5 rounded-full shadow-sm">
            Hoy, 10:45 AM
          </span>
        </div>

        {isLoading && messages.length === 0 && (
          <p className="text-center text-sm text-[#5D6D66] animate-pulse">
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
                  ? "bg-white border border-white rounded-[1.5rem] rounded-tl-sm p-5 text-sm text-[#4A4A4A] shadow-sm max-w-[85%] leading-relaxed whitespace-pre-line"
                  : "bg-[#8DA399] text-white rounded-[1.5rem] rounded-tr-sm p-5 text-sm shadow-md max-w-[85%] self-end leading-relaxed whitespace-pre-line"
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
      </main>

      <footer className="bg-white/90 backdrop-blur-md border-t border-[#E8E4DF] p-4 shrink-0 pb-safe">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-widest uppercase text-[#5D6D66] opacity-60 mb-3 leading-relaxed">
            La IA de K-Notes estructurará esto en un Autorregistro A-B-C para tu Psicólogo.
          </p>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => void handleMicClick()}
              disabled={inputDisabled}
              aria-label={isRecording ? "Detener grabación" : "Hablar con el chat"}
              className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-[#E8E4DF] text-[#4A4A4A] hover:bg-[#D8D4CF]"
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
                className="w-full bg-[#F7F5F2] border border-[#E8E4DF] rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:bg-white focus:border-[#8DA399] focus:ring-1 focus:ring-[#8DA399] transition-all placeholder-[#5D6D66]/50 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => void handleSend()}
                disabled={inputDisabled || !input.trim()}
                aria-label="Enviar"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8DA399] rounded-full flex items-center justify-center text-white hover:bg-[#7D9389] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8DA399]"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
