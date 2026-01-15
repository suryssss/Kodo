import { IconLock, IconLockOpen, IconUsers, IconCopy, IconCheck, IconPlayerPlay, IconEye } from "@tabler/icons-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function RoomHeader({
    roomId,
    status,
    users,
    language,
    handleLanguageChange,
    isRunning,
    runCode,
    isHost,
    isLocked,
    toggleLock,
    isViewer,
    copied,
    copyRoomId
}) {
    return (
        <header className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-white">Live Coding Room</h1>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1.5 ${status === "Connected"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : status === "Disconnected"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${status === "Connected" ? "bg-emerald-500"
                                : status === "Disconnected" ? "bg-red-500"
                                    : "bg-yellow-500"
                                } animate-pulse`} />
                            {status}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-neutral-400">Room: {roomId}</p>
                        <button
                            onClick={copyRoomId}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors"
                            title="Copy Room ID"
                        >
                            {copied ? (
                                <IconCheck className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <IconCopy className="w-4 h-4 text-neutral-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isViewer && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <IconEye className="w-4 h-4" />
                        <span className="text-sm font-medium">Viewer Mode</span>
                    </div>
                )}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <IconUsers className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-300">{users.length}</span>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[160px] bg-neutral-900 border-neutral-800 text-white h-9">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                        {["javascript", "typescript", "python", "java", "cpp", "go", "rust"].map(lang => (
                            <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm h-9"
                    >
                        <IconPlayerPlay className="w-4 h-4" />
                        {isRunning ? "Running..." : "Run"}
                    </button>
                </div>
                {isHost ? (
                    <button
                        onClick={toggleLock}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm h-9 ${isLocked
                            ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            }`}
                    >
                        {isLocked ? <><IconLock className="w-4 h-4" /> Locked</> : <><IconLockOpen className="w-4 h-4" /> Unlocked</>}
                    </button>
                ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border h-9 ${isLocked
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                        {isLocked ? <><IconLock className="w-4 h-4" /> Locked</> : <><IconLockOpen className="w-4 h-4" /> Unlocked</>}
                    </div>
                )}
            </div>
        </header>
    );
}
