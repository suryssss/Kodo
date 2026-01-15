"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function JoinRoomDialog({ children }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [isViewer, setIsViewer] = useState(false);
    const [open, setOpen] = useState(false);

    const handleJoinRoom = (e) => {
        e.preventDefault();

        if (!name.trim() || !roomId.trim()) {
            return;
        }

        // Store username and viewer in localStorage
        localStorage.setItem("username", name.trim());
        localStorage.setItem("isViewer", isViewer.toString());
        router.push(`/room/${roomId.trim()}`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-black border-white">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">Join a Coding Room</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Enter your name and room ID to start collaborating
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoinRoom} className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                            Username
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="roomId" className="block text-sm font-medium text-neutral-300 mb-2">
                            Room ID
                        </label>
                        <input
                            id="roomId"
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="abc123"
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="isViewer"
                            type="checkbox"
                            checked={isViewer}
                            onChange={(e) => setIsViewer(e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black"
                        />
                        <label htmlFor="isViewer" className="text-sm text-neutral-300 select-none cursor-pointer">
                            Join as Viewer (Read-only)
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Join Room
                    </button>
                </form>
            </DialogContent>
        </Dialog >
    );
}
