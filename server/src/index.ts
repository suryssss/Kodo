import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import compression from "compression";
import path from "path";

import rooms, { ChatMessage, Room } from "./roomStore";
try {
    process.loadEnvFile(path.resolve(__dirname, "../.env.local"));
} catch (err) {
}

// Extend Socket.data to store roomId
interface SocketData {
    roomId?: string;
}

const isProd: boolean = process.env.NODE_ENV === "production";
const log = (...args: unknown[]): void => {
    if (!isProd) console.log(...args);
};

const app = express();
app.use(compression())
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    next();
});

const JDOODLE_LANG_MAP: Record<string, { language: string; versionIndex: string }> = {
    javascript: { language: "nodejs", versionIndex: "5" },
    typescript: { language: "typescript", versionIndex: "0" },
    python: { language: "python3", versionIndex: "5" },
    java: { language: "java", versionIndex: "4" },
    cpp: { language: "cpp", versionIndex: "5" },
    go: { language: "go", versionIndex: "4" },
    rust: { language: "rust", versionIndex: "4" }
};

// JDoodle Code Execution proxy endpoint
app.post("/api/execute", async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, language, stdin } = req.body;

        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET || process.env.CLIENT_SECRECT;

        if (!clientId || !clientSecret) {
            res.status(500).json({
                error: "JDoodle API credentials are not configured on the server. Please check .env.local."
            });
            return;
        }

        const mapped = JDOODLE_LANG_MAP[language];
        if (!mapped) {
            res.status(400).json({
                error: `Language '${language}' is not supported by the JDoodle compiler mapping.`
            });
            return;
        }

        const payload = {
            clientId,
            clientSecret,
            script: code,
            language: mapped.language,
            versionIndex: mapped.versionIndex,
            stdin: stdin || ""
        };

        const response = await fetch("https://api.jdoodle.com/v1/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errText = await response.text();
            res.status(response.status).json({
                error: `JDoodle execution failed with status ${response.status}`,
                details: errText
            });
            return;
        }

        const data = (await response.json()) as any;

        res.json({
            output: data.output || "",
            statusCode: data.statusCode,
            memory: data.memory,
            cpuTime: data.cpuTime,
            error: data.error || null
        });

    } catch (err: any) {
        console.error("Execution error in /api/execute:", err);
        res.status(500).json({
            error: "An internal error occurred during code compilation.",
            details: err.message
        });
    }
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: {
            chunkSize: 16 * 1024,
        },
        zlibInflateOptions: {
            chunkSize: 16 * 1024,
        },
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,
    connectTimeout: 45000,
});

app.get("/", (_req: Request, res: Response) => {
    res.send("Server is Running");
});

io.on("connection", (socket: Socket) => {
    log("a user connected", socket.id);

    // Creating a room
    socket.on("join-room", ({ roomId, username }: { roomId: string; username: string }) => {
        log("join-room received:", roomId, username);

        const socketData = socket.data as SocketData;
        if (socketData.roomId) return;

        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: {},
                hostSocketId: socket.id,
                code: "// Start coding together...",
                isLocked: false,
                language: "javascript",
                messages: [],
            };
        }

        // Store roomId
        socketData.roomId = roomId;

        rooms[roomId].users[socket.id] = {
            username,
            socketId: socket.id,
        };

        socket.join(roomId);

        const room: Room = rooms[roomId];
        io.to(socket.id).emit("sync-room", {
            code: room.code,
            language: room.language,
            isLocked: room.isLocked,
            hostSocketId: room.hostSocketId,
        });

        // Send chat history to new user
        io.to(socket.id).emit("chat-history", room.messages);

        if (!room.hostSocketId) {
            room.hostSocketId = socket.id;
            io.to(socket.id).emit("host-assigned", { isHost: true });
        } else {
            io.to(socket.id).emit("host-assigned", {
                isHost: socket.id === room.hostSocketId,
            });
        }

        // userList
        const userList = Object.values(room.users).map((u) => ({
            username: u.username,
            socketId: u.socketId,
            isHost: u.socketId === room.hostSocketId,
        }));

        // joining notification
        io.to(roomId).emit("user-joined", {
            username,
            users: userList,
        });

        log("join-room received:", roomId, username);
    });

    socket.on("code-change", ({ roomId, code }: { roomId: string; code: string }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (room.isLocked && socket.id !== room.hostSocketId) {
            return;
        }

        room.code = code;
        socket.to(roomId).emit("sync-code", { code });
    });

    socket.on("disconnect", () => {
        const socketData = socket.data as SocketData;
        const roomId = socketData.roomId;
        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];
        const user = room.users[socket.id];
        const username = user ? user.username : "Unknown";

        // Remove user
        delete room.users[socket.id];

        if (socket.id === room.hostSocketId) {
            const remainingSocketIds = Object.keys(room.users);
            if (remainingSocketIds.length > 0) {
                room.hostSocketId = remainingSocketIds[0];
                log("new host assigned:", room.hostSocketId);
                // Notification for the new host
                io.to(room.hostSocketId).emit("host-assigned", { isHost: true });
            } else {
                room.hostSocketId = null;
            }
        }

        const userList = Object.values(room.users).map((u) => ({
            username: u.username,
            socketId: u.socketId,
            isHost: u.socketId === room.hostSocketId,
        }));

        io.to(roomId).emit("user-left", {
            username,
            users: userList,
        });

        // Clean up
        if (Object.keys(room.users).length === 0) {
            delete rooms[roomId];
        }
    });

    socket.on("toggle-lock", ({ roomId }: { roomId: string }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (room.hostSocketId !== socket.id) {
            log("only host can lock the room");
            return;
        }
        room.isLocked = !room.isLocked;

        log("room:", roomId, room.isLocked ? "Locked" : "Unlocked");

        io.to(roomId).emit("lock-state-changed", {
            isLocked: room.isLocked,
        });
    });

    socket.on("language-change", ({ roomId, language }: { roomId: string; language: string }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (socket.id !== room.hostSocketId) return;

        room.language = language;

        io.to(roomId).emit("language-update", { language });
    });

    // Chat message handling
    socket.on(
        "send-message",
        ({ roomId, username, message }: { roomId: string; username: string; message: string }) => {
            const room = rooms[roomId];
            if (!room) return;

            const chatMessage: ChatMessage = {
                username,
                message,
                timestamp: Date.now(),
                socketId: socket.id,
            };

            // Store message in room history (limit to last 100 messages)
            room.messages.push(chatMessage);
            if (room.messages.length > 100) {
                room.messages = room.messages.slice(-100);
            }

            // Broadcast to all users in the room
            io.to(roomId).emit("chat-message", chatMessage);
            log("Chat message sent:", username, message);
        }
    );

    socket.on("ping", (callback: unknown) => {
        if (typeof callback === "function") {
            callback();
        }
    });
});

const PORT: number = parseInt(process.env.PORT || "4000", 10);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
