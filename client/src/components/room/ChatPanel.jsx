"use client";

import { useState, useRef, useEffect, memo } from "react";
import { IconSend, IconMessageCircle, IconChevronUp, IconChevronDown, IconMoodSmile, IconX } from "@tabler/icons-react";

const EMOJI_CATEGORIES = {
    "Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "😏", "😒", "😞", "😢", "😭", "😤", "🤯", "😱", "🤗", "🤔", "🤫", "🤐"],
    "Gestures": ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🤚", "🖐️", "✋", "👏", "🙌", "👐", "🤝", "🙏", "💪", "🖕", "✍️"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "Objects": ["💻", "⌨️", "🖥️", "📱", "💡", "🔥", "⚡", "✨", "🎉", "🎊", "🏆", "🎯", "🚀", "💯", "✅", "❌", "⭐", "🌟", "💫", "🔔"],
    "Coding": ["👨‍💻", "👩‍💻", "🐛", "🔧", "⚙️", "🛠️", "📝", "📋", "📁", "💾", "🔒", "🔓", "🔑", "🏷️", "📌", "🔍", "💬", "🗨️", "📢", "📣"]
};

function EmojiPicker({ onSelect, onClose }) {
    const [activeCategory, setActiveCategory] = useState("Smileys");
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full mb-2 right-0 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950">
                <span className="text-xs font-semibold text-neutral-400">Emoji</span>
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
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-lg whitespace-nowrap transition-all ${activeCategory === category
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="p-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <div className="grid grid-cols-8 gap-1">
                    {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-neutral-800 rounded-lg transition-all hover:scale-110"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ChatPanel({ socket, roomId, username, isMinimized, onToggleMinimize }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setMessages((prev) => [...prev, message]);
            if (isMinimized && message.username !== username) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        const handleChatHistory = (history) => {
            setMessages(history);
        };

        socket.on("chat-message", handleNewMessage);
        socket.on("chat-history", handleChatHistory);

        return () => {
            socket.off("chat-message", handleNewMessage);
            socket.off("chat-history", handleChatHistory);
        };
    }, [socket, isMinimized, username]);

    useEffect(() => {
        if (!isMinimized) {
            setUnreadCount(0);
        }
    }, [isMinimized]);

    const handleSendMessage = (e) => {
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

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getAvatarColor = (name) => {
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

    return (
        <div
            className={`flex flex-col bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 ${isMinimized ? "h-12" : "h-80"
                }`}
        >
            <div
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800 cursor-pointer hover:bg-neutral-900/50 transition-colors"
                onClick={onToggleMinimize}
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <IconMessageCircle className="w-5 h-5 text-emerald-500" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-white text-sm">Room Chat</h3>
                    <span className="text-xs text-neutral-500">({messages.length} messages)</span>
                </div>
                <button className="p-1 hover:bg-neutral-800 rounded transition-colors">
                    {isMinimized ? (
                        <IconChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                        <IconChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                </button>
            </div>
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                <IconMessageCircle className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isOwnMessage = msg.username === username;
                                const isSystem = msg.type === "system";

                                if (isSystem) {
                                    return (
                                        <div key={index} className="flex justify-center">
                                            <span className="text-xs text-neutral-500 bg-neutral-900/50 px-3 py-1 rounded-full">
                                                {msg.message}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={index}
                                        className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                                    >
                                        {!isOwnMessage && (
                                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(msg.username)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                                                {msg.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                                            {!isOwnMessage && (
                                                <span className="text-[10px] text-neutral-500 ml-1 mb-0.5 block">
                                                    {msg.username}
                                                </span>
                                            )}
                                            <div
                                                className={`px-3 py-2 rounded-2xl text-sm break-words ${isOwnMessage
                                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md"
                                                    : "bg-neutral-800 text-neutral-100 rounded-bl-md"
                                                    }`}
                                            >
                                                {msg.message}
                                            </div>
                                            <span className={`text-[10px] text-neutral-600 mt-0.5 block ${isOwnMessage ? "text-right mr-1" : "ml-1"}`}>
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-900/50">
                        <div className="flex gap-2 items-center relative">
                            {showEmojiPicker && (
                                <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2 rounded-lg transition-all ${showEmojiPicker
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
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                maxLength={500}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                            >
                                <IconSend className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default memo(ChatPanel);
