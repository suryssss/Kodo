import {
    IconClipboardCopy,
    IconFileBroken,
    IconSignature,
    IconTableColumn,
} from "@tabler/icons-react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";

export default function Bento() {
    const CodeSyncVisual = () => (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute inset-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <span className="ml-2 font-mono text-[10px] text-neutral-500">
                        main.js
                    </span>
                </div>
                <div className="flex-1 space-y-2 font-mono text-xs">
                    <div className="flex items-center gap-3">
                        <span className="text-neutral-600">1</span>
                        <span className="text-purple-400">function</span>
                        <span className="text-blue-400">syncState</span>
                        <span className="text-neutral-400">()</span>
                        <span className="text-neutral-400">{"{"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-neutral-600">2</span>
                        <span className="ml-4 text-neutral-500">// WebSocket broadcast</span>
                    </div>
                    <div className="flex items-center gap-3 animate-pulse">
                        <span className="text-neutral-600">3</span>
                        <span className="ml-4 text-blue-400">socket</span>
                        <span className="text-neutral-400">.</span>
                        <span className="text-yellow-400">emit</span>
                        <span className="text-neutral-400">(</span>
                        <span className="text-green-400">&apos;code&apos;</span>
                        <span className="text-neutral-400">)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-neutral-600">4</span>
                        <span className="text-neutral-400">{"}"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5">
                    <div className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">
                        WebSocket connected • 3 clients synced
                    </span>
                </div>
            </div>
        </div>
    );

    // Host control visualization
    const HostControlVisual = () => (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-neutral-950">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                {/* Lock icon representation */}
                <div className="rounded-lg border border-white/10 bg-neutral-900/50 p-4">
                    <svg
                        className="h-8 w-8 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>

                {/* Status text */}
                <div className="text-center">
                    <div className="mb-1 font-mono text-xs text-neutral-500">
                        Editor State
                    </div>
                    <div className="font-medium text-neutral-300">Host Controlled</div>
                </div>
            </div>
        </div>
    );

    // Room architecture visualization
    const RoomVisual = () => (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-neutral-950">
            <div className="absolute inset-0 flex items-center justify-center p-6">
                {/* Room container */}
                <div className="relative">
                    {/* Central room node */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
                        <IconTableColumn className="h-8 w-8 text-blue-400" />
                    </div>

                    {/* Connected client nodes */}
                    <div className="absolute -left-12 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-white/20 bg-neutral-800">
                        <div className="flex h-full items-center justify-center font-mono text-[10px] text-neutral-400">
                            C1
                        </div>
                    </div>
                    <div className="absolute -right-12 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-white/20 bg-neutral-800">
                        <div className="flex h-full items-center justify-center font-mono text-[10px] text-neutral-400">
                            C2
                        </div>
                    </div>
                    <div className="absolute left-1/2 -top-12 h-8 w-8 -translate-x-1/2 rounded-full border border-white/20 bg-neutral-800">
                        <div className="flex h-full items-center justify-center font-mono text-[10px] text-neutral-400">
                            C3
                        </div>
                    </div>

                    {/* Connection lines */}
                    <svg className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
                        <line
                            x1="10"
                            y1="40"
                            x2="40"
                            y2="40"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                        <line
                            x1="80"
                            y1="40"
                            x2="110"
                            y2="40"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                        <line
                            x1="60"
                            y1="0"
                            x2="60"
                            y2="30"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    </svg>
                </div>
            </div>

            {/* Room ID label */}
            <div className="absolute bottom-3 left-3 font-mono text-[10px] text-neutral-600">
                room://abc-123
            </div>
        </div>
    );

    // Live presence visualization
    const PresenceVisual = () => (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-neutral-950">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                {/* User avatars */}
                <div className="flex -space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-950 bg-gradient-to-br from-blue-500 to-blue-600 font-mono text-xs font-semibold text-white">
                        A
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-950 bg-gradient-to-br from-purple-500 to-purple-600 font-mono text-xs font-semibold text-white">
                        B
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-950 bg-gradient-to-br from-emerald-500 to-emerald-600 font-mono text-xs font-semibold text-white">
                        C
                    </div>
                </div>

                {/* Active status */}
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    <span className="font-mono text-xs text-neutral-400">
                        3 active users
                    </span>
                </div>
            </div>
        </div>
    );

    const items = [
        {
            title: "Real-Time Code Sync",
            description:
                "Instantly synchronizes code across all users in a room using WebSockets, with the server acting as the single source of truth.",
            header: <CodeSyncVisual />,
            className: "md:col-span-2",
            icon: <IconClipboardCopy className="h-4 w-4 text-emerald-400" />,
        },
        {
            title: "Host-Controlled Editing",
            description:
                "The first user becomes the host and can lock or unlock the editor, preventing conflicting edits during collaboration.",
            header: <HostControlVisual />,
            className: "md:col-span-1",
            icon: <IconFileBroken className="h-4 w-4 text-neutral-400" />,
        },
        {
            title: "Live User Presence",
            description:
                "Displays connected users in real time and handles join, leave, and refresh events gracefully.",
            header: <PresenceVisual />,
            className: "md:col-span-1",
            icon: <IconSignature className="h-4 w-4 text-neutral-400" />,
        },
        {
            title: "Room-Based Sessions",
            description:
                "Users collaborate inside isolated rooms, ensuring updates, presence, and state are scoped correctly per session.",
            header: <RoomVisual />,
            className: "md:col-span-2",
            icon: <IconTableColumn className="h-4 w-4 text-blue-400" />,
        },
    ];

    return (
        <BentoGrid className="mx-auto max-w-6xl md:auto-rows-[20rem]">
            {items.map((item, i) => (
                <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    className={item.className}
                    icon={item.icon}
                />
            ))}
        </BentoGrid>
    );
}
