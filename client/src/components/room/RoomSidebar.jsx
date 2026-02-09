import { memo } from "react";
import { IconUsers } from "@tabler/icons-react";

function RoomSidebar({ users, isHost, username, roomStats }) {
    return (
        <aside className="w-72 border-l border-neutral-800 bg-neutral-950 flex flex-col">
            <div className="p-4 border-b border-neutral-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                    <IconUsers className="w-5 h-5 text-emerald-500" />
                    Connected Users ({users.length})
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {users.map((user) => (
                    <div
                        key={user.socketId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 group hover:border-emerald-500/30 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                                        Host
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Room Info</h3>
                <div className="space-y-2 text-xs text-neutral-400">
                    <div className="flex justify-between">
                        <span>Latency</span>
                        <span className={`${roomStats?.latency > 100 ? "text-yellow-400" : roomStats?.latency > 300 ? "text-red-400" : "text-emerald-400"}`}>
                            {roomStats?.latency ? `~${roomStats.latency}ms` : "Measuring..."}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Protocol</span>
                        <span className="capitalize">{roomStats?.protocol || "Connecting..."}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Secure</span>
                        <span className={roomStats?.secure ? "text-emerald-400" : "text-yellow-400"}>
                            {roomStats?.secure ? "Yes (WSS)" : "No (WS)"}
                        </span>
                    </div>
                    {isHost && <div className="mt-2 pt-2 border-t border-neutral-800 text-center text-emerald-400 font-medium">You are the host</div>}
                </div>
            </div>
        </aside>
    );
}
export default memo(RoomSidebar);
