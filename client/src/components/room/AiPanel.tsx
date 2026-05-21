"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    IconSparkles,
    IconCode,
    IconMessageChatbot,
    IconSend,
    IconWand,
    IconLoader2,
    IconBulb,
    IconAlertTriangle,
} from "@tabler/icons-react";

interface AiDebugInfo {
    executionId: string | null;
    explanation: string;
    fixedCode: string;
    originalError: string;
}

interface ChatEntry {
    role: "user" | "ai";
    message: string;
}

interface AiPanelProps {
    code: string;
    language: string;
    output: string;
    executionId: string | null;
    aiDebugInfo: AiDebugInfo | null;
    onApplyFix: (fixedCode: string) => void;
    canEdit: boolean;
}

export default function AiPanel({
    code,
    language,
    output,
    executionId,
    aiDebugInfo,
    onApplyFix,
    canEdit,
}: AiPanelProps) {
    const [activeSubTab, setActiveSubTab] = useState<"review" | "explain" | "chat">("explain");
    const [explanation, setExplanation] = useState<string>("");
    const [review, setReview] = useState<string>("");
    const [isLoadingExplain, setIsLoadingExplain] = useState(false);
    const [isLoadingReview, setIsLoadingReview] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatEntry[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);

    const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Auto-switch to explain tab when debug info arrives
    useEffect(() => {
        if (aiDebugInfo) {
            setActiveSubTab("explain");
        }
    }, [aiDebugInfo]);

    const handleExplain = useCallback(async () => {
        if (!code.trim()) return;
        setIsLoadingExplain(true);
        setExplanation("");
        try {
            const res = await fetch(`${backendUrl}/api/ai/explain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language, output, executionId }),
            });
            const data = await res.json();
            if (data.explanation) {
                setExplanation(data.explanation);
            } else {
                setExplanation("Failed to get explanation: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            setExplanation("Network error: Could not reach the AI service.");
        } finally {
            setIsLoadingExplain(false);
        }
    }, [code, language, output, executionId, backendUrl]);

    const handleReview = useCallback(async () => {
        if (!code.trim()) return;
        setIsLoadingReview(true);
        setReview("");
        try {
            const res = await fetch(`${backendUrl}/api/ai/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language, executionId }),
            });
            const data = await res.json();
            if (data.review) {
                setReview(data.review);
            } else {
                setReview("Failed to get review: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            setReview("Network error: Could not reach the AI service.");
        } finally {
            setIsLoadingReview(false);
        }
    }, [code, language, executionId, backendUrl]);

    const handleChatSend = useCallback(async () => {
        const question = chatInput.trim();
        if (!question) return;

        setChatMessages(prev => [...prev, { role: "user", message: question }]);
        setChatInput("");
        setIsLoadingChat(true);

        try {
            // Build context from previous messages
            const previousContext = chatMessages
                .map(m => `${m.role === "user" ? "User" : "AI"}: ${m.message}`)
                .join("\n");

            const res = await fetch(`${backendUrl}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language, previousContext, question }),
            });
            const data = await res.json();
            setChatMessages(prev => [
                ...prev,
                { role: "ai", message: data.answer || data.error || "No response" },
            ]);
        } catch {
            setChatMessages(prev => [
                ...prev,
                { role: "ai", message: "Network error: Could not reach AI." },
            ]);
        } finally {
            setIsLoadingChat(false);
        }
    }, [chatInput, chatMessages, code, language, backendUrl]);

    const subTabs = [
        { key: "explain" as const, label: "Explain", icon: IconBulb },
        { key: "review" as const, label: "Review", icon: IconCode },
        { key: "chat" as const, label: "AI Chat", icon: IconMessageChatbot },
    ];

    // Simple markdown-like renderer for AI responses
    const renderMarkdown = (text: string) => {
        if (!text) return null;
        const lines = text.split("\n");
        return (
            <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
                {lines.map((line, i) => {
                    // Headings
                    if (line.startsWith("## ")) {
                        return (
                            <h3 key={i} className="text-base font-bold text-emerald-400 mt-4 mb-1">
                                {line.replace("## ", "")}
                            </h3>
                        );
                    }
                    if (line.startsWith("# ")) {
                        return (
                            <h2 key={i} className="text-lg font-bold text-emerald-300 mt-4 mb-1">
                                {line.replace("# ", "")}
                            </h2>
                        );
                    }
                    // Bold
                    if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                            <p key={i} className="font-semibold text-white">
                                {line.replace(/\*\*/g, "")}
                            </p>
                        );
                    }
                    // Code block markers
                    if (line.startsWith("```")) {
                        return null;
                    }
                    // List items
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                        return (
                            <p key={i} className="pl-4 text-neutral-300">
                                <span className="text-emerald-500 mr-2">•</span>
                                {renderInlineFormatting(line.slice(2))}
                            </p>
                        );
                    }
                    // Numbered list
                    if (/^\d+\.\s/.test(line)) {
                        const match = line.match(/^(\d+)\.\s(.*)$/);
                        if (match) {
                            return (
                                <p key={i} className="pl-4 text-neutral-300">
                                    <span className="text-emerald-500 font-mono mr-2">{match[1]}.</span>
                                    {renderInlineFormatting(match[2])}
                                </p>
                            );
                        }
                    }
                    // Empty lines
                    if (!line.trim()) {
                        return <div key={i} className="h-1" />;
                    }
                    // Normal paragraph
                    return <p key={i}>{renderInlineFormatting(line)}</p>;
                })}
            </div>
        );
    };

    const renderInlineFormatting = (text: string) => {
        // Handle inline code, bold, and italic
        const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("`") && part.endsWith("`")) {
                return (
                    <code key={i} className="bg-neutral-800 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={i} className="text-neutral-200">{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Sub-tab switcher */}
            <div className="flex gap-1 p-2 bg-neutral-900/50 border-b border-neutral-800">
                {subTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSubTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeSubTab === tab.key
                                ? "bg-violet-500/15 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                                : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                        }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Auto-Debug Error Alert Card */}
            {aiDebugInfo && activeSubTab === "explain" && (
                <div className="mx-3 mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 rounded-md bg-amber-500/20">
                            <IconAlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-xs font-semibold text-amber-400">Smart Error Debugger</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                        {aiDebugInfo.explanation}
                    </p>
                    {canEdit && aiDebugInfo.fixedCode !== code && (
                        <button
                            onClick={() => onApplyFix(aiDebugInfo.fixedCode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                        >
                            <IconWand className="w-3.5 h-3.5" />
                            Apply AI Fix
                        </button>
                    )}
                </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                {/* EXPLAIN TAB */}
                {activeSubTab === "explain" && (
                    <div className="flex flex-col h-full">
                        {!explanation && !isLoadingExplain && !aiDebugInfo && (
                            <div className="flex flex-col items-center justify-center flex-1 text-neutral-600 gap-3 py-8">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center">
                                    <IconBulb className="w-7 h-7 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Code Explanation</p>
                                <p className="text-xs text-center text-neutral-600 max-w-48">
                                    Click below to get a step-by-step explanation of your code
                                </p>
                                <button
                                    onClick={handleExplain}
                                    disabled={!code.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <IconSparkles className="w-3.5 h-3.5" />
                                    Explain This Code
                                </button>
                            </div>
                        )}
                        {isLoadingExplain && (
                            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                                    <IconSparkles className="w-4 h-4 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-xs text-neutral-400 animate-pulse">AI is analyzing your code...</p>
                            </div>
                        )}
                        {explanation && !isLoadingExplain && (
                            <div>
                                {renderMarkdown(explanation)}
                                <button
                                    onClick={handleExplain}
                                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                >
                                    <IconSparkles className="w-3 h-3" />
                                    Re-explain
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* REVIEW TAB */}
                {activeSubTab === "review" && (
                    <div className="flex flex-col h-full">
                        {!review && !isLoadingReview && (
                            <div className="flex flex-col items-center justify-center flex-1 text-neutral-600 gap-3 py-8">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center">
                                    <IconCode className="w-7 h-7 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Code Review</p>
                                <p className="text-xs text-center text-neutral-600 max-w-48">
                                    Get AI-powered feedback on code quality, complexity, and best practices
                                </p>
                                <button
                                    onClick={handleReview}
                                    disabled={!code.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <IconCode className="w-3.5 h-3.5" />
                                    Review My Code
                                </button>
                            </div>
                        )}
                        {isLoadingReview && (
                            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                                    <IconCode className="w-4 h-4 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-xs text-neutral-400 animate-pulse">Reviewing your code...</p>
                            </div>
                        )}
                        {review && !isLoadingReview && (
                            <div>
                                {renderMarkdown(review)}
                                <button
                                    onClick={handleReview}
                                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                                >
                                    <IconCode className="w-3 h-3" />
                                    Re-review
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* CHAT TAB */}
                {activeSubTab === "chat" && (
                    <div className="flex flex-col h-full">
                        {chatMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center flex-1 text-neutral-600 gap-3 py-8">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center">
                                    <IconMessageChatbot className="w-7 h-7 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">AI Q&A</p>
                                <p className="text-xs text-center text-neutral-600 max-w-48">
                                    Ask follow-up questions about your code. The AI has full context of your editor.
                                </p>
                            </div>
                        )}
                        <div className="flex-1 space-y-3">
                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md"
                                                : "bg-neutral-800 text-neutral-200 border border-neutral-700/50 rounded-bl-md"
                                        }`}
                                    >
                                        {msg.role === "ai"
                                            ? renderMarkdown(msg.message)
                                            : msg.message}
                                    </div>
                                </div>
                            ))}
                            {isLoadingChat && (
                                <div className="flex justify-start">
                                    <div className="bg-neutral-800 border border-neutral-700/50 rounded-xl rounded-bl-md px-3 py-2 flex items-center gap-2">
                                        <IconLoader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                                        <span className="text-xs text-neutral-400">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Chat input (only visible on chat tab) */}
            {activeSubTab === "chat" && (
                <div className="p-3 border-t border-neutral-800 bg-neutral-900/50">
                    <div className="flex gap-2">
                        <input
                            ref={chatInputRef}
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleChatSend();
                                }
                            }}
                            placeholder="Ask about your code..."
                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        />
                        <button
                            onClick={handleChatSend}
                            disabled={!chatInput.trim() || isLoadingChat}
                            className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
                        >
                            <IconSend className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Quick actions (on explain/review tabs) */}
            {activeSubTab !== "chat" && (
                <div className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex gap-2">
                    <button
                        onClick={handleExplain}
                        disabled={isLoadingExplain || !code.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium rounded-lg transition-all border border-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <IconBulb className="w-3.5 h-3.5" />
                        Explain
                    </button>
                    <button
                        onClick={handleReview}
                        disabled={isLoadingReview || !code.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-lg transition-all border border-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <IconCode className="w-3.5 h-3.5" />
                        Review
                    </button>
                </div>
            )}
        </div>
    );
}
