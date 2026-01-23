"use client";
import { IconCode, IconUsers, IconTerminal2, IconBrandVscode, IconPlus, IconShare, IconUserCode } from "@tabler/icons-react";
import LightRays from './LightRays';
import { JoinRoomDialog } from "./JoinRoomDialog";

export default function Hero() {
    const navItems = [
        { name: "Home", link: "#home" },
        { name: "About", link: "#about" },
        { name: "Github", link: "https://github.com/suryssss/Kodo" },
    ];

    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
            <div className="absolute inset-0">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#10b981"
                    raysSpeed={1.2}
                    lightSpread={0.9}
                    rayLength={2.0}
                    followMouse={true}
                    mouseInfluence={0}
                    noiseAmount={0.08}
                    distortion={0.03}
                />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />

            {/* Navbar */}
            <nav className="relative z-50 w-full">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <a
                                href="/"
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-md group-hover:bg-emerald-500/30 transition-all" />
                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                        <IconCode className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <span className="text-xl font-semibold text-white tracking-tight">
                                    Kodo
                                </span>
                            </a>

                            {/* Navigation Links */}
                            <div className="hidden md:flex items-center gap-8">
                                {navItems.map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.link}
                                        target={item.link.startsWith("http") ? "_blank" : "_self"}
                                        rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                        className="relative text-sm text-neutral-300 hover:text-white transition-colors group"
                                    >
                                        {item.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Right side: CTA Buttons */}
                        <div className="flex items-center ">
                            <JoinRoomDialog>
                                <button className="px-5 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-100 transition-all hover:scale-105">
                                    Join a room
                                </button>
                            </JoinRoomDialog>
                        </div>
                    </div>
                </div>
            </nav>

            {/*Hero*/}
            <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex justify-center mb-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-sm">
                            <div className="h-2 w-2 rounded-full bg-teal-400" />
                            <span className="text-sm font-medium text-teal-300">
                                Real-Time Team Collaboration
                            </span>
                            <svg className="w-3 h-3 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="
                            text-5xl md:text-5xl lg:text-6xl
                            font-semibold
                            text-center
                            mb-4
                            tracking-tight
                            leading-tight
                            bg-gradient-to-b
                            from-white
                            via-[#9EF0D0]
                            to-[#6FDAC1]
                            bg-clip-text
                            text-transparent
                            ">
                        Write code together
                        <br />
                        with friends in real time
                    </h1>
                    <p className="text-lg md:text-xl text-white text-neutral-400 text-center max-w-3xl mx-auto mb-8 leading-relaxed">
                        Create a<span className="text-blue-400"> room</span>, <span className="text-purple-400"> invite friends,</span>, and <span className="text-emerald-400">watch everyone code together instantly</span>
                        <br />
                        across all sessions and devices—all in one platform
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <JoinRoomDialog>
                            <button className="group px-8 py-4 bg-white text-black font-semibold rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                Click here to create the room
                            </button>
                        </JoinRoomDialog>
                    </div>
                    <div className="mt-24 w-full max-w-5xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-semibold text-center text-white mb-14">
                            How it works ?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.08] hover:border-emerald-500/20 transition-all duration-300 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center group-hover:ring-emerald-500/40 transition-all">
                                        <IconPlus className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-400/80 tracking-wide uppercase">Step 1</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Create a room
                                </h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Click one button to get your own private workspace. No signup required.
                                </p>
                            </div>
                            <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.08] hover:border-emerald-500/20 transition-all duration-300 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center group-hover:ring-emerald-500/40 transition-all">
                                        <IconShare className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-400/80 tracking-wide uppercase">Step 2</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Join using same room id
                                </h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Send it to a friend, classmate, or mentor. They join instantly.
                                </p>
                            </div>
                            <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.08] hover:border-emerald-500/20 transition-all duration-300 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center group-hover:ring-emerald-500/40 transition-all">
                                        <IconUserCode className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-400/80 tracking-wide uppercase">Step 3</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Code together
                                </h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    See the same screen, type together, and learn in real time.
                                </p>
                            </div>
                        </div>
                        <p className="text-center text-neutral-500 mt-12 text-sm">
                            No downloads · No accounts · Just click and start
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
