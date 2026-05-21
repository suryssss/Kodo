import { memo, useMemo, useEffect, useRef, useState } from "react";
import { IconMessageCircle, IconX, IconChevronRight, IconMoodSmile, IconSend, IconSparkles } from "@tabler/icons-react";
import { Socket } from "socket.io-client";
import AiPanel from "./AiPanel";

// Define Emoji Category map directly
const EMOJI_CATEGORIES: Record<string, string[]> = {
    "😀 Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "😏", "😒", "😞", "😢", "😭", "😤", "🤯", "😱", "🤗", "🤔", "🤫", "🤐"],
    "👍 Gestures": ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🤚", "🖐️", "✋", "👏", "🙌", "👐", "🤝", "🙏", "💪", "🖕", "✍️"],
    "❤️ Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "🚀 Objects": ["💻", "⌨️", "🖥️", "📱", "💡", "🔥", "⚡", "✨", "🎉", "🎊", "🏆", "🎯", "🚀", "💯", "✅", "❌", "⭐", "🌟", "💫", "🔔"],
    "👨‍💻 Coding": ["👨‍💻", "👩‍💻", "🐛", "🔧", "⚙️", "🛠️", "📝", "📋", "📁", "💾", "🔒", "🔓", "🔑", "🏷️", "📌", "🔍", "💬", "🗨️", "📢", "📣"]
};

// Extracted Emoji Picker Component for better type checking
interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

function EmojiPicker({ onSelect, onClose, activeCategory, setActiveCategory }: EmojiPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full mb-2 right-4 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950">
                <span className="text-xs font-semibold text-neutral-400">Choose an Emoji</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-800 rounded transition-colors"
                >
                    <IconX className="w-3.5 h-3.5 text-neutral-500" />
                </button>
            </div>
            <div className="flex gap-1 px-2 py-2 border-b border-neutral-800 overflow-x-auto scrollbar-none">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${activeCategory === category
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="p-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <div className="grid grid-cols-8 gap-1">
                    {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-neutral-800 rounded-lg transition-all hover:scale-110 active:scale-95"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Component logic below
// -------------------------------------------------------------

export interface ChatMessage {
    username: string;
    message: string;
    timestamp: number;
    socketId?: string;
    type?: string;
}

interface AiDebugInfo {
    executionId: string | null;
    explanation: string;
    fixedCode: string;
    originalError: string;
}

interface ChatSidebarProps {
    socket: Socket;
    roomId: string;
    username: string;
    isOpen: boolean;
    onToggle: () => void;
    unreadCount?: number;
    // AI panel props
    code: string;
    language: string;
    output: string;
    executionId: string | null;
    aiDebugInfo: AiDebugInfo | null;
    onApplyFix: (fixedCode: string) => void;
    canEdit: boolean;
    sidebarTab: "chat" | "ai";
    onSidebarTabChange: (tab: "chat" | "ai") => void;
}

function ChatSidebar({
    socket,
    roomId,
    username,
    isOpen,
    onToggle,
    code,
    language,
    output,
    executionId,
    aiDebugInfo,
    onApplyFix,
    canEdit,
    sidebarTab,
    onSidebarTabChange,
}: ChatSidebarProps) {
    // using local React state for messages, no changes needed
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setLocalUnreadCount(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
            if (!isOpen && message.username !== username) {
                setLocalUnreadCount((prev) => prev + 1);
            }
        };

        const handleChatHistory = (history: ChatMessage[]) => {
            setMessages(history);
        };

        socket.on("chat-message", handleNewMessage);
        socket.on("chat-history", handleChatHistory);

        return () => {
            socket.off("chat-message", handleNewMessage);
            socket.off("chat-history", handleChatHistory);
        };
    }, [socket, isOpen, username]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket) return;

        socket.emit("send-message", {
            roomId,
            username,
            message: newMessage.trim(),
        });

        setNewMessage("");
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            "from-purple-500 to-violet-600",
            "from-blue-500 to-cyan-600",
            "from-emerald-500 to-teal-600",
            "from-orange-500 to-amber-600",
            "from-pink-500 to-rose-600",
            "from-indigo-500 to-blue-600",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const groupedMessages = useMemo(() => messages.reduce((acc: { username: string; messages: ChatMessage[]; type?: string }[], msg, idx) => {
        const prevMsg = messages[idx - 1];
        const isSameUser = prevMsg && prevMsg.username === msg.username && msg.type !== "system" && prevMsg.type !== "system";
        const timeDiff = prevMsg ? msg.timestamp - prevMsg.timestamp : Infinity;
        const isWithinTimeWindow = timeDiff < 60000;

        if (isSameUser && isWithinTimeWindow) {
            acc[acc.length - 1].messages.push(msg);
        } else {
            acc.push({
                username: msg.username,
                messages: [msg],
                type: msg.type
            });
        }
        return acc;
    }, []), [messages]);

    return (
        <>
            <button
                onClick={onToggle}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 px-2 py-4 rounded-l-xl transition-all duration-300 shadow-xl ${isOpen
                    ? "bg-neutral-800 hover:bg-neutral-700 translate-x-0"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                    }`}
                style={{ right: isOpen ? "320px" : "0" }}
            >
                <div className="relative">
                    {isOpen ? (
                        <IconChevronRight className="w-5 h-5 text-white" />
                    ) : (
                        <>
                            <IconMessageCircle className="w-5 h-5 text-white" />
                            {localUnreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {localUnreadCount > 9 ? "9+" : localUnreadCount}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </button>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onToggle}
                />
            )}
            <aside
                className={`fixed right-0 top-0 h-full w-80 border-l border-neutral-800 bg-neutral-950 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Unified Tab Header */}
                <div className="p-3 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${sidebarTab === "chat"
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                : "bg-gradient-to-br from-violet-500 to-purple-600"
                                }`}>
                                {sidebarTab === "chat"
                                    ? <IconMessageCircle className="w-4 h-4 text-white" />
                                    : <IconSparkles className="w-4 h-4 text-white" />
                                }
                            </div>
                            <div>
                                <h2 className="font-semibold text-white text-sm">
                                    {sidebarTab === "chat" ? "Room Chat" : "AI Assistant"}
                                </h2>
                                <p className="text-[10px] text-neutral-500">
                                    {sidebarTab === "chat"
                                        ? `${messages.length} messages`
                                        : "Code analysis & Q&A"
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onToggle}
                            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <IconX className="w-4 h-4 text-neutral-400" />
                        </button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
                        <button
                            onClick={() => onSidebarTabChange("chat")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${sidebarTab === "chat"
                                ? "bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            <IconMessageCircle className="w-3.5 h-3.5" />
                            Chat
                            {localUnreadCount > 0 && sidebarTab !== "chat" && (
                                <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {localUnreadCount > 9 ? "9+" : localUnreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => onSidebarTabChange("ai")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${sidebarTab === "ai"
                                ? "bg-violet-500/15 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.1)]"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            <IconSparkles className="w-3.5 h-3.5" />
                            AI Assistant
                        </button>
                    </div>
                </div>

                {/* Chat Tab Content */}
                {sidebarTab === "chat" && (
                    <>
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                        >
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
                                        <IconMessageCircle className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium">No messages yet</p>
                                    <p className="text-xs text-neutral-600 mt-1">Start the conversation!</p>
                                </div>
                            ) : (
                                groupedMessages.map((group, groupIdx) => {
                                    if (group.type === "system") {
                                        return group.messages.map((msg, msgIdx) => (
                                            <div key={`${groupIdx}-${msgIdx}`} className="flex justify-center">
                                                <span className="text-[10px] text-neutral-500 bg-neutral-900/50 px-3 py-1 rounded-full">
                                                    {msg.message}
                                                </span>
                                            </div>
                                        ));
                                    }

                                    const isOwnMessage = group.username === username;

                                    return (
                                        <div
                                            key={groupIdx}
                                            className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                                        >
                                            {/* Avatar */}
                                            {!isOwnMessage && (
                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(group.username)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
                                                    {group.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            {/* Messages */}
                                            <div className={`flex flex-col gap-1 max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                                                {!isOwnMessage && (
                                                    <span className="text-[10px] text-neutral-500 ml-1 font-medium">
                                                        {group.username}
                                                    </span>
                                                )}
                                                {group.messages.map((msg, msgIdx) => (
                                                    <div key={msgIdx} className="group relative">
                                                        <div
                                                            className={`px-3.5 py-2 text-sm break-words ${isOwnMessage
                                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-emerald-500/10"
                                                                : "bg-neutral-800/80 text-neutral-100 rounded-2xl rounded-bl-md border border-neutral-700/50"
                                                                }`}
                                                        >
                                                            {msg.message}
                                                        </div>
                                                        <span className={`text-[9px] text-neutral-600 mt-0.5 block opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? "text-right mr-1" : "ml-1"}`}>
                                                            {formatTime(msg.timestamp)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-800 bg-neutral-900/50 relative">
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmojiPicker(false)}
                                    activeCategory={activeCategory}
                                    setActiveCategory={setActiveCategory}
                                />
                            )}

                            <div className="flex gap-2 items-center">
                                {/* Emoji Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 rounded-lg transition-all flex-shrink-0 ${showEmojiPicker
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300"
                                        }`}
                                >
                                    <IconMoodSmile className="w-5 h-5" />
                                </button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    maxLength={500}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none flex-shrink-0"
                                >
                                    <IconSend className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-neutral-600 mt-2 text-center">
                                Press Enter to send • {500 - newMessage.length} characters left
                            </p>
                        </form>
                    </>
                )}

                {/* AI Tab Content */}
                {sidebarTab === "ai" && (
                    <AiPanel
                        code={code}
                        language={language}
                        output={output}
                        executionId={executionId}
                        aiDebugInfo={aiDebugInfo}
                        onApplyFix={onApplyFix}
                        canEdit={canEdit}
                    />
                )}
            </aside>
        </>
    );
}

export default memo(ChatSidebar);
