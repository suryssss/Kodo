import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
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
