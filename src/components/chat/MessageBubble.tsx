import { memo } from "react";
import { motion } from "motion/react";

type MessageBubbleProps = {
  role: "ai" | "user";
  text: string;
  showCaret?: boolean;
  isThinking?: boolean;
};

export const MessageBubble = memo(function MessageBubble({
  role,
  text,
  showCaret = false,
  isThinking = false,
}: MessageBubbleProps) {
  const isAi = role === "ai";

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={
        isAi
          ? "bg-[#EEF6FC] border border-[#DDEAF5] rounded-[1.5rem] rounded-tl-sm p-4 md:p-5 text-sm text-[#3D4F5C] shadow-sm max-w-[85%] leading-relaxed whitespace-pre-line [contain:layout]"
          : "bg-gradient-to-br from-[#7EB8DA] to-[#5A9BC4] text-white rounded-[1.5rem] rounded-tr-sm p-4 md:p-5 text-sm shadow-md max-w-[85%] leading-relaxed whitespace-pre-line [contain:layout]"
      }
    >
      {isThinking ? (
        <span className="inline-flex items-center gap-1 h-5" aria-label="Pensando">
          <span className="chat-thinking-dot" />
          <span className="chat-thinking-dot animation-delay-150" />
          <span className="chat-thinking-dot animation-delay-300" />
        </span>
      ) : (
        <>
          {text}
          {showCaret && (
            <span className="inline-block w-[2px] h-4 bg-current ml-0.5 align-middle animate-pulse" />
          )}
        </>
      )}
    </motion.div>
  );
});
