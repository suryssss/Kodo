import { memo, useState } from "react";
import {
    IconLock,
    IconLockOpen,
    IconUsers,
    IconCopy,
    IconCheck,
    IconPlayerPlay,
    IconEye,
    IconChevronDown,
    IconWifi,
    IconShield,
    IconCrown
} from "@tabler/icons-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    roomStats
}) {
    const [showUsersDropdown, setShowUsersDropdown] = useState(false);

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
        <header className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-gradient-to-r from-neutral-950 to-neutral-900">
            {/* Left Section - Room Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-white">Kodo</h1>
                    <div className="h-5 w-px bg-neutral-700" />
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 ${status === "Connected"
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

                {/* Room ID */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <span className="text-xs text-neutral-500">Room:</span>
                    <code className="text-xs text-neutral-300 font-mono">{roomId}</code>
                    <button
                        onClick={copyRoomId}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors ml-1"
                        title="Copy Room ID"
                    >
                        {copied ? (
                            <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <IconCopy className="w-3.5 h-3.5 text-neutral-400 hover:text-white" />
                        )}
                    </button>
                </div>

                {/* Network Stats */}
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="flex items-center gap-1.5">
                        <IconWifi className="w-3.5 h-3.5 text-neutral-500" />
                        <span className={`text-xs font-medium ${roomStats?.latency > 100 ? "text-yellow-400" : roomStats?.latency > 300 ? "text-red-400" : "text-emerald-400"}`}>
                            {roomStats?.latency ? `${roomStats.latency}ms` : "..."}
                        </span>
                    </div>
                    <div className="h-3 w-px bg-neutral-700" />
                    <div className="flex items-center gap-1.5">
                        <IconShield className={`w-3.5 h-3.5 ${roomStats?.secure ? "text-emerald-500" : "text-yellow-500"}`} />
                        <span className="text-xs text-neutral-400">{roomStats?.secure ? "WSS" : "WS"}</span>
                    </div>
                </div>
            </div>

            {/* Center Section - Connected Users */}
            <div className="flex items-center gap-2">
                {/* User Avatars Stack */}
                <div
                    className="relative flex items-center cursor-pointer"
                    onClick={() => setShowUsersDropdown(!showUsersDropdown)}
                >
                    <div className="flex -space-x-2">
                        {users.slice(0, 4).map((user, idx) => (
                            <div
                                key={user.socketId}
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(user.username)} flex items-center justify-center text-white text-xs font-bold border-2 border-neutral-950 shadow-lg relative`}
                                style={{ zIndex: users.length - idx }}
                                title={user.username}
                            >
                                {user.username.charAt(0).toUpperCase()}
                                {user.isHost && (
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center border border-neutral-950">
                                        <IconCrown className="w-2 h-2 text-yellow-900" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {users.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold border-2 border-neutral-950">
                                +{users.length - 4}
                            </div>
                        )}
                    </div>
                    <div className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-700/50 transition-colors">
                        <IconUsers className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-white">{users.length}</span>
                        <IconChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Users Dropdown */}
                    {showUsersDropdown && (
                        <div className="absolute top-full mt-2 right-0 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-3 border-b border-neutral-800 bg-neutral-950">
                                <h4 className="text-sm font-semibold text-white">Connected Users</h4>
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2">
                                {users.map((user) => (
                                    <div
                                        key={user.socketId}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(user.username)} flex items-center justify-center text-white text-xs font-bold`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {user.username}
                                                {user.username === username && (
                                                    <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">YOU</span>
                                                )}
                                            </p>
                                            {user.isHost && (
                                                <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                                                    <IconCrown className="w-2.5 h-2.5" /> Host
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center gap-3">
                {isViewer && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <IconEye className="w-4 h-4" />
                        <span className="text-xs font-medium">Viewer</span>
                    </div>
                )}

                <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[140px] bg-neutral-900 border-neutral-700 text-white h-9 text-sm">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                        {["javascript", "typescript", "python", "java", "cpp", "go", "rust"].map(lang => (
                            <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm h-9 shadow-lg shadow-emerald-500/20"
                >
                    <IconPlayerPlay className="w-4 h-4" />
                    {isRunning ? "Running..." : "Run"}
                </button>

                {isHost ? (
                    <button
                        onClick={toggleLock}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm h-9 ${isLocked
                            ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            }`}
                    >
                        {isLocked ? <><IconLock className="w-4 h-4" /> Locked</> : <><IconLockOpen className="w-4 h-4" /> Unlocked</>}
                    </button>
                ) : (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border h-9 ${isLocked
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

export default memo(RoomHeader);
