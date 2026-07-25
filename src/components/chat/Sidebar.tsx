import { useNavigate } from "react-router-dom";
import { createChat, deleteChat, renameChat } from "../../services/chat.service";
import { getMessagesByChat } from "../../services/message.service";
import { useAuthStore } from "../../store/auth.store";
import { useChatStore } from "../../store/chat.store";
import { socket } from "../../services/socket";
import { logoutUser } from "../../services/auth.service";
import { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function Sidebar() {
  const navigate = useNavigate();
  const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [chatTitle, setChatTitle] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState<boolean>(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const { chats, activeChat, setChats, setActiveChat, setMessages, isAiThinking, } = useChatStore();
  const filteredChats = chats.filter((chat) =>
    chat.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      socket.disconnect();
      setUser(null);
      setChats([]);
      setMessages([]);
      setActiveChat(null);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
    finally {
      setIsLoggingOut(false);
    }
  };

  const handleCreateNewChat = async () => {
    if (!chatTitle.trim()) {
      return;
    }

    try {
      const response = await createChat(chatTitle);
      setChats([response.chat, ...chats]);
      setActiveChat(response.chat);
      setMessages([]);
      setChatTitle("");
      setIsCreatingChat(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (activeChat?.id === chatId) {
      return;
    }

    try {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setActiveChat(chat);
        const response = await getMessagesByChat(chatId);
        setMessages(response.messages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChatId) return;

    try {
      setIsDeletingChat(true);

      await deleteChat(selectedChatId);

      const updatedChats = chats.filter(
        (chat) => chat.id !== selectedChatId,
      );

      setChats(updatedChats);

      if (activeChat?.id === selectedChatId) {
        setActiveChat(null);
        setMessages([]);
      }

      setShowDeleteDialog(false);
      setSelectedChatId(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeletingChat(false);
    }
  };

  const handleRenameChat = async () => {
    if (!editingChatId || !editingTitle.trim()) {
      return;
    }

    try {
      const response = await renameChat(
        editingChatId,
        editingTitle,
      );

      const updatedChats = chats.map((chat) =>
        chat.id === editingChatId
          ? response.chat
          : chat
      );

      setChats(updatedChats);

      if (activeChat?.id === editingChatId) {
        setActiveChat(response.chat);
      }

      setEditingChatId(null);
      setEditingTitle("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <aside
      className="flex w-72 flex-col backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(30, 32, 34, 0.6)",
        borderRightColor: "rgba(82, 97, 107, 0.3)",
        borderRightWidth: "1px",
      }}
    >
      {/* Header */}
      <div
        className="p-4 space-y-3"
        style={{
          borderBottomColor: "rgba(82, 97, 107, 0.3)",
          borderBottomWidth: "1px",
        }}
      >
        <div className="flex items-center gap-3 px-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: "#52616B" }}
          />
          <h2 className="text-sm font-semibold" style={{ color: "#C9D6DF" }}>
            Dot-GPT
          </h2>
        </div>

        {isCreatingChat ? (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Enter chat title..."
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateNewChat();
                } else if (e.key === "Escape") {
                  setIsCreatingChat(false);
                  setChatTitle("");
                }
              }}
              disabled={isAiThinking}
              className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none placeholder:text-[#52616B] transition-all"
              style={{
                backgroundColor: "rgba(82, 97, 107, 0.2)",
                borderColor: "#52616B",
                borderWidth: "1px",
              }}
            />
            <button
              onClick={handleCreateNewChat}
              disabled={isAiThinking}
              className="px-3 py-2 rounded-lg text-white text-sm font-medium cursor-pointer transition-colors"
              style={{ backgroundColor: "#52616B" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6B7D8A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#52616B";
              }}
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingChat(true)}
            disabled={isAiThinking}
            className="w-full btn-primary-light py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5m-15-4h12m-12 4v8m0-8l2-2m-2 2l-2-2" />
            </svg>
            New Chat
          </button>
        )}
        <input
          type="text"
          placeholder="Search chats..."
          disabled={isAiThinking}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
    w-full
    px-3
    py-2
    rounded-lg
    text-sm
    text-white
    outline-none
    placeholder:text-[#52616B]
  "
          style={{
            backgroundColor: "rgba(82, 97, 107, 0.2)",
            borderColor: "#52616B",
            borderWidth: "1px",
          }}
        />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chats.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: "#52616B" }}
          >
            <p>No chats yet</p>
            <p className="text-xs mt-1">Create one to get started</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="group flex items-center gap-2"
            >
              <button
                onClick={() => handleSelectChat(chat.id)}
                disabled={isAiThinking}
                className={`flex-1 text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 truncate cursor-pointer ${activeChat?.id === chat.id ? "border" : ""
                  }`}
                title={chat.title}
                style={
                  activeChat?.id === chat.id
                    ? {
                      backgroundColor: "rgba(82, 97, 107, 0.25)",
                      borderColor: "#52616B",
                      color: "#F0F5F9",
                    }
                    : {
                      color: "#C9D6DF",
                    }
                }
                onMouseEnter={(e) => {
                  if (activeChat?.id !== chat.id) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(82, 97, 107, 0.15)";
                    e.currentTarget.style.color = "#F0F5F9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeChat?.id !== chat.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#C9D6DF";
                  }
                }}
              >
                {editingChatId === chat.id ? (
                  <input
                    autoFocus
                    value={editingTitle}
                    disabled={isAiThinking}
                    onChange={(e) =>
                      setEditingTitle(e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameChat();
                      }

                      if (e.key === "Escape") {
                        setEditingChatId(null);
                        setEditingTitle("");
                      }
                    }}
                    className="w-full bg-transparent outline-none"
                    style={{
                      color: "#F0F5F9",
                    }}
                  />
                ) : (
                  <span className="block truncate flex items-center justify-between">
                    {chat.title}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setEditingChatId(chat.id);
                        setEditingTitle(chat.title);
                      }}
                      disabled={isAiThinking}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shrink-0 p-1 rounded-lg hover:bg-white/10"
                      style={{
                        color: "#C9D6DF",
                      }}
                    >
                      <MdEdit />
                    </button>
                  </span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChatId(chat.id);
                  setShowDeleteDialog(true);
                }}
                disabled={isAiThinking}
                className="opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer shrink-0 p-2 rounded-lg hover:bg-red-300/10"
                style={{
                  color: "#D97373",
                }}
              >
                <MdDelete />
              </button>
            </div>
          ))
        )}
      </div>

      {/* User profile */}
      <div
        className="p-4 space-y-3"
        style={{
          borderTopColor: "rgba(82, 97, 107, 0.3)",
          borderTopWidth: "1px",
        }}
      >
        <div className="glass rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#F0F5F9" }}>
              {user?.name.firstName} {user?.name.lastName}
            </p>
            <p className="text-xs mt-1 truncate" style={{ color: "#52616B" }}>
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut || isAiThinking}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "rgba(159, 86, 86, 0.15)",
              borderColor: "rgba(159, 86, 86, 0.3)",
              borderWidth: "1px",
              color: "#D97373",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(159, 86, 86, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(159, 86, 86, 0.15)";
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Chat"
        description="This chat will be permanently deleted along with all of its messages. This action cannot be undone."
        isLoading={isDeletingChat}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedChatId(null);
        }}
        onConfirm={handleDeleteChat}
      />
    </aside>
  );
}
