import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    perMessageDeflate: {
        threshold: 1024
    },
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 30000,
    forceNew: true
});

export default socket;
