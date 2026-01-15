import { Marquee } from "./ui/marquee";
import { IconPlugConnected, IconUsers, IconRefresh, IconLock, IconServer, IconCode, IconBolt, IconNetwork } from "@tabler/icons-react";

export default function ScrollCards() {
    const features = [
        {
            name: "WebSocket Sync",
            description: "Real-time bidirectional communication",
            icon: IconPlugConnected,
            color: "from-emerald-400 to-teal-500",
        },
        {
            name: "Room-Based",
            description: "Isolated collaboration spaces",
            icon: IconUsers,
            color: "from-blue-400 to-indigo-500",
        },
        {
            name: "State Management",
            description: "Server as single source of truth",
            icon: IconServer,
            color: "from-purple-400 to-pink-500",
        },
        {
            name: "Live Presence",
            description: "Track connected users in real-time",
            icon: IconNetwork,
            color: "from-cyan-400 to-blue-500",
        },
        {
            name: "Auto Reconnect",
            description: "Handles refresh & disconnect events",
            icon: IconRefresh,
            color: "from-orange-400 to-red-500",
        },
        {
            name: "Host Control",
            description: "First user becomes room host",
            icon: IconLock,
            color: "from-yellow-400 to-orange-500",
        },
        {
            name: "Code Broadcast",
            description: "Instant updates across all clients",
            icon: IconBolt,
            color: "from-emerald-500 to-green-600",
        },
        {
            name: "Conflict-Free",
            description: "Synchronized editor state",
            icon: IconCode,
            color: "from-indigo-400 to-purple-500",
        },
    ];

    const FeatureCard = ({ feature }) => {
        const Icon = feature.icon;
        return (
            <div className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-6 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105 min-w-[280px]">
                <div className="flex items-center gap-4">
                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {feature.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {feature.description}
                        </p>
                    </div>
                </div>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 blur-xl transition-opacity`} />
            </div>
        );
    };
    return (
        <section className="relative py-20 overflow-hidden bg-black">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Built for real-time collaboration
                </h2>
                <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                    Powered by WebSockets for instant synchronization and seamless team coding
                </p>
            </div>
            <div className="relative">
                <Marquee pauseOnHover className="[--duration:40s] mb-4">
                    {features.slice(0, 4).map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:40s]">
                    {features.slice(4, 8).map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-black to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-black to-transparent" />
            </div>
        </section>
    );
}
