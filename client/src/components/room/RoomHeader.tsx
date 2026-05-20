import { memo, MouseEvent } from "react";
import Link from "next/link";
import {
    IconCode,
    IconPlayerPlay,
    IconLock,
    IconLockOpen,
    IconCopy,
    IconCheck,
    IconUsers,
    IconWifi,
    IconWifiOff,
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RoomSidebar from "./RoomSidebar";

interface UserInfo {
    username: string;
    socketId: string;
    isHost: boolean;
}

interface RoomStats {
    latency: number | null;
    protocol: string;
    secure: boolean;
}

interface RoomHeaderProps {
    roomId: string;
    status: string;
    users: UserInfo[];
    username: string;
    language: string;
    handleLanguageChange: (language: string) => void;
    isRunning: boolean;
    runCode: () => void;
    isHost: boolean;
    isLocked: boolean;
    toggleLock: () => void;
    isViewer: boolean;
    copied: boolean;
    copyRoomId: () => void;
    roomStats: RoomStats;
}

function RoomHeader({
    roomId,
    status,
    users,
    username,
    language,
    handleLanguageChange,
    isRunning,
    runCode,
    isHost,
    isLocked,
    toggleLock,
    isViewer,
    copied,
    copyRoomId,
    roomStats,
}: RoomHeaderProps) {
    const handleRunClick = (e: MouseEvent<HTMLButtonElement>) => {
        // Find the button with the ripple effect class
        const button = e.currentTarget;
        const ripple = document.createElement("span");
        const rect = button.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.className = "absolute w-20 h-20 bg-white/30 rounded-full blur-md animate-ripple -translate-x-1/2 -translate-y-1/2 pointer-events-none";

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

        runCode();
    };

    return (
        <header className="h-16 shrink-0 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-4 sticky top-0 z-50">
            {/* Left Section: Logo & Status */}
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all group-hover:scale-105">
                        <IconCode className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white tracking-tight hidden sm:block group-hover:text-emerald-400 transition-colors">
                        Kodo
                    </span>
                </Link>

                <div className="h-6 w-px bg-neutral-800 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${status === "Connected"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                            }`}
                    >
                        {status === "Connected" ? (
                            <IconWifi className="w-3.5 h-3.5" />
                        ) : (
                            <IconWifiOff className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">{status}</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
                        <span className="text-neutral-500">Room:</span>
                        <span className="font-mono text-neutral-300 font-medium select-all">
                            {roomId}
                        </span>
                        <button
                            onClick={copyRoomId}
                            className="ml-1 p-1 hover:bg-neutral-800 hover:text-emerald-400 rounded transition-colors text-neutral-400"
                            title="Copy Room ID"
                        >
                            {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full text-xs font-medium transition-all group">
                                <IconUsers className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-400" />
                                <span className="text-neutral-300">{users.length} <span className="hidden sm:inline">Online</span></span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-fit">
                            <RoomSidebar users={users} isHost={isHost} username={username} roomStats={roomStats} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Right Section: Controls */}
            <div className="flex items-center gap-3">
                <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={!isHost || isViewer}
                    className={`bg-neutral-900 text-sm border border-neutral-800 rounded-lg px-3 py-2 outline-none transition-all ${isHost && !isViewer ? "hover:border-neutral-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" : "opacity-75 cursor-not-allowed"}`}
                >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                </select>

                <div className="h-6 w-px bg-neutral-800 hidden sm:block" />

                <button
                    onClick={handleRunClick}
                    disabled={isRunning}
                    className="group relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    {isRunning ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    ) : (
                        <IconPlayerPlay className="w-4 h-4 relative z-10" />
                    )}
                    <span className="hidden sm:inline relative z-10">Run Code</span>
                </button>

                {isHost && (
                    <button
                        onClick={toggleLock}
                        className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${isLocked
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            }`}
                        title={isLocked ? "Unlock Room" : "Lock Room"}
                    >
                        {isLocked ? <IconLock className="w-4 h-4" /> : <IconLockOpen className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </header>
    );
}

export default memo(RoomHeader);
