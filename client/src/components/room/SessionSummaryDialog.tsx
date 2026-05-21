"use client";

import { useState, useCallback } from "react";
import {
    IconSparkles,
    IconLoader2,
    IconClipboardCopy,
    IconCheck,
    IconX,
    IconCode,
    IconBug,
    IconUsers,
    IconRocket,
    IconDownload,
} from "@tabler/icons-react";

interface SessionSummaryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
}

interface SummaryData {
    id: string;
    summary: string;
    stats: {
        executionCount: number;
        errorCount: number;
        participants: string[];
    };
}

export default function SessionSummaryDialog({ isOpen, onClose, roomId }: SessionSummaryDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [error, setError] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    const generateSummary = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`${backendUrl}/api/ai/summarize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId }),
            });
            const data = await res.json();
            if (res.ok) {
                setSummaryData(data);
            } else {
                setError(data.error || "Failed to generate summary");
            }
        } catch {
            setError("Network error: Could not reach the AI service.");
        } finally {
            setIsLoading(false);
        }
    }, [roomId, backendUrl]);

    const copyToClipboard = useCallback(() => {
        if (!summaryData) return;
        navigator.clipboard.writeText(summaryData.summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [summaryData]);

    const downloadMarkdown = useCallback(() => {
        if (!summaryData) return;
        const blob = new Blob([summaryData.summary], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session-summary-${roomId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [summaryData, roomId]);

    // Simple markdown renderer
    const renderMarkdown = (text: string) => {
        const lines = text.split("\n");
        return (
            <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
                {lines.map((line, i) => {
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
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                        return (
                            <p key={i} className="pl-4 text-neutral-300">
                                <span className="text-emerald-500 mr-2">•</span>
                                {line.slice(2)}
                            </p>
                        );
                    }
                    if (line.startsWith("```")) return null;
                    if (!line.trim()) return <div key={i} className="h-1" />;
                    return <p key={i}>{line}</p>;
                })}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative w-full max-w-lg mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <IconSparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">Session Summary</h2>
                            <p className="text-xs text-neutral-500">AI-generated session report</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <IconX className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                    {/* Initial state */}
                    {!summaryData && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
                                <IconRocket className="w-10 h-10 text-violet-400 opacity-60" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-white">Ready to summarize</p>
                                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                                    Generate a comprehensive AI report of this coding session including statistics, code analysis, and learning highlights
                                </p>
                            </div>
                            <button
                                onClick={generateSummary}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                            >
                                <IconSparkles className="w-4 h-4" />
                                Generate Summary
                            </button>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                                <IconSparkles className="w-5 h-5 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-sm text-neutral-400 animate-pulse">Generating session summary...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                            <button
                                onClick={generateSummary}
                                className="mt-3 text-xs underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Summary result */}
                    {summaryData && (
                        <div>
                            {/* Stats cards */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                                    <IconCode className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{summaryData.stats.executionCount}</p>
                                    <p className="text-[10px] text-neutral-500">Executions</p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
                                    <IconBug className="w-5 h-5 text-red-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{summaryData.stats.errorCount}</p>
                                    <p className="text-[10px] text-neutral-500">Errors</p>
                                </div>
                                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center">
                                    <IconUsers className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{summaryData.stats.participants.length}</p>
                                    <p className="text-[10px] text-neutral-500">Participants</p>
                                </div>
                            </div>

                            {/* Summary content */}
                            {renderMarkdown(summaryData.summary)}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                {summaryData && (
                    <div className="flex items-center gap-2 p-4 border-t border-neutral-800 bg-neutral-900/50">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-all border border-neutral-700"
                        >
                            {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconClipboardCopy className="w-3.5 h-3.5" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            onClick={downloadMarkdown}
                            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-all border border-neutral-700"
                        >
                            <IconDownload className="w-3.5 h-3.5" />
                            Download .md
                        </button>
                        <div className="flex-1" />
                        <button
                            onClick={generateSummary}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium rounded-lg transition-all border border-violet-500/20 disabled:opacity-40"
                        >
                            <IconSparkles className="w-3.5 h-3.5" />
                            Regenerate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
