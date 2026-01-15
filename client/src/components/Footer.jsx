import { IconBrandGithub, IconBrandTwitter, IconBrandDiscord, IconCode, IconHeart, IconBrandLinkedin } from "@tabler/icons-react";

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-2 text-white font-bold text-xl">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <IconCode className="w-5 h-5 text-white" />
                            </div>
                            Kodo
                        </div>
                        <p className="text-neutral-400 leading-relaxed max-w-sm">
                            Real-time collaborative code editor designed for developers.
                            Build, debug, and ship faster together with instant synchronization
                            and powerful tools.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink href="#" icon={IconBrandGithub} label="GitHub" />
                            <SocialLink href="#" icon={IconBrandLinkedin} label="Linkdin" />
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold text-white mb-4">Links</h3>
                            <ul className="space-y-3">
                                <FooterLink href="#">Home</FooterLink>
                                <FooterLink href="#">About</FooterLink>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon: Icon, label }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all hover:scale-110 active:scale-95"
            aria-label={label}
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}

function FooterLink({ href, children }) {
    return (
        <li>
            <a
                href={href}
                className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm hover:translate-x-1 inline-block duration-200"
            >
                {children}
            </a>
        </li>
    );
}
