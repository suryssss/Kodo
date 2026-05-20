import { Dispatch, SetStateAction } from "react";
import { IconTerminal2, IconCode, IconPlayerPlay } from "@tabler/icons-react";

interface OutputConsoleProps {
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
    output: string;
    stdin: string;
    setStdin: Dispatch<SetStateAction<string>>;
}

export default function OutputConsole({
    activeTab,
    setActiveTab,
    output,
    stdin,
    setStdin
}: OutputConsoleProps) {
    return (
        <section className="h-64 flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl">
            <div className="flex bg-neutral-900/50 border-b border-neutral-800 p-2 gap-2">
                <button
                    onClick={() => setActiveTab("output")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "output"
                            ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                        }`}
                >
                    <IconTerminal2 className="w-4 h-4" />
                    Console Output
                </button>
                <button
                    onClick={() => setActiveTab("input")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "input"
                            ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                        }`}
                >
                    <IconCode className="w-4 h-4" />
                    Standard Input
                </button>
            </div>
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
