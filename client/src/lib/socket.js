import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],

    perMessageDeflate: {
        threshold: 1024
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false
});

export default socket;
