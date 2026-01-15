"use client";
import { IconCode, IconUsers, IconTerminal2, IconBrandVscode } from "@tabler/icons-react";
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
                        Code together,
                        <br />
                        ship together, everywhere.
                    </h1>
                    <p className="text-lg md:text-xl text-white text-neutral-400 text-center max-w-3xl mx-auto mb-8 leading-relaxed">
                        Seamlessly <span className="text-blue-400">💻 sync code</span>, <span className="text-purple-400">📡 broadcast changes</span>, and <span className="text-emerald-400">🤝 collaborate in real-time</span>
                        <br />
                        across all sessions and devices—all in one platform
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <JoinRoomDialog>
                            <button className="group px-8 py-4 bg-white text-black font-semibold rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                Try it out
                            </button>
                        </JoinRoomDialog>

                        <a href="https://github.com/suryssss/Kodo" target="_blank" rel="noopener noreferrer" className="group px-8 py-4 text-white font-semibold rounded-lg transition-all hover:text-emerald-400 flex items-center gap-2">
                            Github
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                    <div className="relative h-[400px] max-w-4xl mx-auto  mt-16">
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                            <line
                                x1="50%"
                                y1="60"
                                x2="50%"
                                y2="144"
                                stroke="rgba(100,100,100,0.3)"
                                strokeWidth="1.5"
                                strokeDasharray="6,6"
                            />
                            <line
                                x1="50%"
                                y1="256"
                                x2="50%"
                                y2="340"
                                stroke="rgba(100,100,100,0.3)"
                                strokeWidth="1.5"
                                strokeDasharray="6,6"
                            />
                            <line
                                x1="60"
                                y1="50%"
                                x2="144"
                                y2="50%"
                                stroke="rgba(100,100,100,0.3)"
                                strokeWidth="1.5"
                                strokeDasharray="6,6"
                            />
                            <line
                                x1="calc(100% - 144px)"
                                y1="50%"
                                x2="calc(100% - 60px)"
                                y2="50%"
                                stroke="rgba(100,100,100,0.3)"
                                strokeWidth="1.5"
                                strokeDasharray="6,6"
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 10 }}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-3xl scale-150" />
                                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-300 border-2 border-emerald-500/30 flex items-center justify-center shadow-2xl">
                                    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ zIndex: 5 }}>
                            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center hover:border-emerald-500/50 transition-all">
                                <IconCode className="w-8 h-8 text-neutral-400" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 5 }}>
                            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center hover:border-emerald-500/50 transition-all">
                                <IconTerminal2 className="w-8 h-8 text-neutral-400" />
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-0 -translate-y-1/2" style={{ zIndex: 5 }}>
                            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center hover:border-emerald-500/50 transition-all">
                                <IconUsers className="w-8 h-8 text-neutral-400" />
                            </div>
                        </div>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2" style={{ zIndex: 5 }}>
                            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center hover:border-emerald-500/50 transition-all">
                                <IconBrandVscode className="w-8 h-8 text-neutral-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
