import { useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { socket } from "../../services/socket";
import { toast } from "sonner";

export function ChatInput() {
  const [message, setMessage] = useState<string>("");
  const { activeChat, addMessage, isAiThinking, setIsAiThinking } =
    useChatStore();

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (!activeChat) {
      toast("Please select a chat to start chatting.");
      return;
    }

    const messagePayload = {
      chat: activeChat.id,
      content: message,
    };

    addMessage({
      ...messagePayload,
      role: "user",
    });

    setIsAiThinking(true);

    socket.emit("ai-message", messagePayload);

    setMessage("");
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="border-t p-6"
      style={{
        borderColor: "rgba(82, 97, 107, 0.3)",
        backgroundColor: "#0B0D0F",
      }}
    >
      <div
        className="flex items-end gap-4 rounded-2xl border p-4 transition-colors duration-200"
        style={{
          backgroundColor: "rgba(82, 97, 107, 0.12)",
          borderColor: "rgba(82, 97, 107, 0.3)",
        }}
      >
        <textarea
          rows={1}
          placeholder="Message AI..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e as any);
            }
          }}
          disabled={isAiThinking}
          className="max-h-40 flex-1 resize-none bg-transparent text-base outline-none font-medium disabled:opacity-50"
          style={{
            color: "#F0F5F9",
          }}
        />

        <button
          type="submit"
          disabled={isAiThinking || !message.trim()}
          className="px-6 py-2.5 text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          style={{
            backgroundColor: "#52616B",
            color: "#F0F5F9",
            boxShadow: "0 4px 12px rgba(82, 97, 107, 0.25)",
          }}
        >
          {isAiThinking ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>

              <span>Send</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: "#52616B" }}>
        Press Enter to send • Shift+Enter for new line
      </p>
    </form>
  );
}
