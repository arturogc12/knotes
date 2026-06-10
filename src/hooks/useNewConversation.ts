import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatSession } from "../contexts/ChatSessionContext";

export function useNewConversation() {
  const { chatState, resetSession } = useChatSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  const disabled = isBusy || chatState.phase === "closing";

  const startNewConversation = useCallback(async (): Promise<boolean> => {
    if (disabled) return false;

    const isClosed = chatState.phase === "closed";
    if (!isClosed) {
      const confirmed = window.confirm(t("chat.newConversationConfirm"));
      if (!confirmed) return false;
    }

    setIsBusy(true);
    try {
      await resetSession();
      if (pathname !== "/chat") {
        navigate("/chat");
      }
      return true;
    } finally {
      setIsBusy(false);
    }
  }, [chatState.phase, disabled, navigate, pathname, resetSession, t]);

  return { startNewConversation, isBusy, disabled };
}
