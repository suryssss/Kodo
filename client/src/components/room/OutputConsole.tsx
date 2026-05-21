import { Dispatch, SetStateAction, useCallback, useRef } from "react";
import {
    IconTerminal2,
    IconCode,
    IconPlayerPlay,
    IconGripHorizontal,
    IconBulb,
    IconSparkles,
} from "@tabler/icons-react";

interface OutputConsoleProps {
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
    output: string;
    stdin: string;
    setStdin: Dispatch<SetStateAction<string>>;
    // Drag-to-resize props
    consoleHeight: number;
    onResizeStart: (e: React.PointerEvent) => void;
    // AI action buttons
    onExplainClick: () => void;
    onReviewClick: () => void;
    hasOutput: boolean;
}

export default function OutputConsole({
    activeTab,
    setActiveTab,
    output,
    stdin,
    setStdin,
    consoleHeight,
    onResizeStart,
    onExplainClick,
    onReviewClick,
    hasOutput,
}: OutputConsoleProps) {
    return (
        <section
            className="flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl flex-shrink-0"
            style={{ height: `${consoleHeight}px` }}
        >
            {/* Drag Handle */}
            <div
                onPointerDown={onResizeStart}
                className="h-2 w-full cursor-ns-resize flex items-center justify-center bg-neutral-900/80 hover:bg-neutral-800 transition-colors group select-none touch-none"
            >
                <IconGripHorizontal className="w-4 h-4 text-neutral-700 group-hover:text-neutral-500 transition-colors" />
            </div>

            {/* Tab bar */}
            <div className="flex items-center bg-neutral-900/50 border-b border-neutral-800 px-2 py-1 gap-1">
                <button
                    onClick={() => setActiveTab("output")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "output"
                            ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                        }`}
                >
                    <IconTerminal2 className="w-3.5 h-3.5" />
                    Output
                </button>
                <button
                    onClick={() => setActiveTab("input")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "input"
                            ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                        }`}
                >
                    <IconCode className="w-3.5 h-3.5" />
                    Input
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* AI action buttons */}
                <button
                    onClick={onExplainClick}
                    disabled={!hasOutput}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-violet-400/70 hover:text-violet-400 hover:bg-violet-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Explain this code"
                >
                    <IconBulb className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Explain</span>
                </button>
                <button
                    onClick={onReviewClick}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    title="Review my code"
                >
                    <IconSparkles className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Review</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-neutral-950 relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                {activeTab === "output" ? (
                    <div className="p-4 font-mono text-sm leading-relaxed">
                        {!output ? (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3">
                                <IconPlayerPlay className="w-8 h-8 opacity-50" />
                                <span>Click Run to see output here</span>
                            </div>
                        ) : (
                            <pre className={`whitespace-pre-wrap ${output.startsWith("Error") ? "text-red-400" : "text-emerald-400/90"}`}>
                                {output}
                            </pre>
                        )}
                    </div>
                ) : (
                    <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter input for your program here..."
                        className="w-full h-full bg-transparent text-emerald-400/90 font-mono text-sm p-4 resize-none focus:outline-none placeholder-neutral-700"
                        spellCheck="false"
                    />
                )}
            </div>
        </section>
    );
}
