import { memo } from "react";
import { IconTerminal, IconList } from "@tabler/icons-react";

function OutputConsole({
    activeTab,
    setActiveTab,
    output,
    stdin,
    setStdin
}) {
    return (
        <div className="h-48 rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col">
            <div className="flex items-center border-b border-neutral-800 bg-neutral-900 justify-between pr-4">
                <div className="flex items-center">
                    <button
                        onClick={() => setActiveTab("output")}
                        className={`flex items-center gap-2 px-4 py-2 border-r border-neutral-800 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === "output"
                            ? "bg-neutral-800 text-white border-b-2 border-b-emerald-500"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 border-b-2 border-b-transparent"
                            }`}
                    >
                        <IconTerminal className="w-3.5 h-3.5" />
                        Output
                    </button>
                    <button
                        onClick={() => setActiveTab("input")}
                        className={`flex items-center gap-2 px-4 py-2 border-r border-neutral-800 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === "input"
                            ? "bg-neutral-800 text-white border-b-2 border-b-emerald-500"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 border-b-2 border-b-transparent"
                            }`}
                    >
                        Input
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-neutral-950">
                {/* Output Panel */}
                <div className={`absolute inset-0 p-4 overflow-auto ${activeTab === "output" ? "block" : "hidden"}`}>
                    <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
                        {output || "Run your code to see output here..."}
                    </pre>
                </div>

                {/* Input Panel */}
                <div className={`absolute inset-0 ${activeTab === "input" ? "block" : "hidden"}`}>
                    <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter input here (one line per input)..."
                        className="w-full h-full p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
export default memo(OutputConsole);
