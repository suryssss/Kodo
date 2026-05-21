import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import compression from "compression";
import path from "path";

try {
    process.loadEnvFile(path.resolve(__dirname, "../.env.local"));
} catch (err) {}
try {
    process.loadEnvFile(path.resolve(__dirname, "../.env"));
} catch (err) {}

import { prisma } from "./db";
import { Message as PrismaMessage } from "@prisma/client";
import rooms, { ChatMessage, Room } from "./roomStore";
import { explainCode, reviewCode, debugError, summarizeSession, chatFollowUp } from "./gemini";

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
        const { code, language, stdin, roomId, username } = req.body;

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
        const outputText = data.output || "";
        const isError = !!(data.error || (data.statusCode && data.statusCode !== 200) || /error|exception|traceback|undefined is not|cannot read|segmentation fault/i.test(outputText));

        // Save execution history to DB
        let executionId: string | null = null;
        if (roomId && username) {
            try {
                const execution = await prisma.executionHistory.create({
                    data: {
                        roomId,
                        username,
                        code,
                        language,
                        stdin: stdin || "",
                        output: outputText,
                        isError,
                    }
                });
                executionId = execution.id;
            } catch (dbErr) {
                console.error("Failed to save execution history:", dbErr);
            }
        }

        // If error detected, auto-debug with AI asynchronously
        if (isError && roomId) {
            // Fire-and-forget: don't block the response
            (async () => {
                try {
                    const debugResult = await debugError(code, language, outputText);
                    // Broadcast to all users in the room
                    io.to(roomId).emit("ai-error-debug", {
                        executionId,
                        explanation: debugResult.explanation,
                        fixedCode: debugResult.fixedCode,
                        originalError: outputText,
                    });
                    // Save to DB
                    if (executionId) {
                        await prisma.executionHistory.update({
                            where: { id: executionId },
                            data: { aiExplanation: debugResult.explanation }
                        }).catch(() => {});
                    }
                } catch (aiErr) {
                    console.error("AI auto-debug failed:", aiErr);
                }
            })();
        }

        res.json({
            output: outputText,
            statusCode: data.statusCode,
            memory: data.memory,
            cpuTime: data.cpuTime,
            error: data.error || null,
            executionId,
            isError,
        });

    } catch (err: any) {
        console.error("Execution error in /api/execute:", err);
        res.status(500).json({
            error: "An internal error occurred during code compilation.",
            details: err.message
        });
    }
});

// --- AI Endpoints ---

// Explain code + output
app.post("/api/ai/explain", async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, language, output, executionId } = req.body;
        const explanation = await explainCode(code, language, output || "");

        // Save to DB if executionId provided
        if (executionId) {
            await prisma.executionHistory.update({
                where: { id: executionId },
                data: { aiExplanation: explanation }
            }).catch(() => {});
        }

        res.json({ explanation });
    } catch (err: any) {
        console.error("AI explain error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Review code
app.post("/api/ai/review", async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, language, executionId } = req.body;
        const review = await reviewCode(code, language);

        if (executionId) {
            await prisma.executionHistory.update({
                where: { id: executionId },
                data: { aiReview: review }
            }).catch(() => {});
        }

        res.json({ review });
    } catch (err: any) {
        console.error("AI review error:", err);
        res.status(500).json({ error: err.message });
    }
});

// AI chat follow-up
app.post("/api/ai/chat", async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, language, previousContext, question } = req.body;
        const answer = await chatFollowUp(code, language, previousContext || "", question);
        res.json({ answer });
    } catch (err: any) {
        console.error("AI chat error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Session summarizer
app.post("/api/ai/summarize", async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.body;
        if (!roomId) {
            res.status(400).json({ error: "roomId is required" });
            return;
        }

        const room = rooms[roomId];
        const finalCode = room?.code || "";
        const language = room?.language || "javascript";
        const participants = room ? Object.values(room.users).map(u => u.username) : [];

        // Get execution stats from DB
        const [executionCount, errorCount] = await Promise.all([
            prisma.executionHistory.count({ where: { roomId } }),
            prisma.executionHistory.count({ where: { roomId, isError: true } }),
        ]);

        const summary = await summarizeSession(finalCode, language, executionCount, errorCount, participants);

        // Save summary to DB
        const saved = await prisma.sessionSummary.create({
            data: {
                roomId,
                summary,
                finalCode,
                stats: JSON.stringify({ executionCount, errorCount, participants }),
            }
        });

        res.json({ id: saved.id, summary, stats: { executionCount, errorCount, participants } });
    } catch (err: any) {
        console.error("AI summarize error:", err);
        res.status(500).json({ error: err.message });
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

const debounceTimers: Record<string, NodeJS.Timeout> = {};

io.on("connection", (socket: Socket) => {
    log("a user connected", socket.id);

    socket.on("join-room", async ({ roomId, username }: { roomId: string; username: string }) => {
        log("join-room received:", roomId, username);

        const socketData = socket.data as SocketData;
        if (socketData.roomId) return;

        try {
            let dbRoom = await prisma.room.findUnique({ where: { id: roomId } });
            if (!dbRoom) {
                dbRoom = await prisma.room.create({
                    data: {
                        id: roomId,
                        code: "// Start coding together...",
                        language: "javascript",
                        isLocked: false
                    }
                });
            }

            const dbMessages = await prisma.message.findMany({
                where: { roomId },
                orderBy: { timestamp: "asc" },
                take: 100
            });
            const chatHistory: ChatMessage[] = dbMessages.map((m: PrismaMessage) => ({
                username: m.username,
                message: m.message,
                timestamp: m.timestamp.getTime(),
                socketId: m.socketId
            }));

            await prisma.session.upsert({
                where: { socketId: socket.id },
                update: { roomId, username },
                create: { socketId: socket.id, roomId, username }
            });

            if (!rooms[roomId]) {
                rooms[roomId] = {
                    users: {},
                    hostSocketId: socket.id,
                    code: dbRoom.code,
                    isLocked: dbRoom.isLocked,
                    language: dbRoom.language,
                    messages: chatHistory,
                };
            }
        } catch (error) {
            console.error("Database error during join-room:", error);
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
        }

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

        io.to(socket.id).emit("chat-history", room.messages);

        if (!room.hostSocketId) {
            room.hostSocketId = socket.id;
            io.to(socket.id).emit("host-assigned", { isHost: true });
        } else {
            io.to(socket.id).emit("host-assigned", {
                isHost: socket.id === room.hostSocketId,
            });
        }

        const userList = Object.values(room.users).map((u) => ({
            username: u.username,
            socketId: u.socketId,
            isHost: u.socketId === room.hostSocketId,
        }));

        io.to(roomId).emit("user-joined", {
            username,
            users: userList,
        });
    });

    socket.on("code-change", ({ roomId, code }: { roomId: string; code: string }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (room.isLocked && socket.id !== room.hostSocketId) {
            return;
        }

        room.code = code;
        socket.to(roomId).emit("sync-code", { code });

        if (debounceTimers[roomId]) {
            clearTimeout(debounceTimers[roomId]);
        }
        debounceTimers[roomId] = setTimeout(async () => {
            try {
                await prisma.room.update({
                    where: { id: roomId },
                    data: { code: room.code }
                });
                log(`Saved code for room ${roomId} to DB.`);
            } catch (error) {
                console.error(`Failed to save code for room ${roomId}:`, error);
            }
        }, 15000);
    });

    socket.on("disconnect", async () => {
        const socketData = socket.data as SocketData;
        const roomId = socketData.roomId;

        try {
            await prisma.session.delete({ where: { socketId: socket.id } }).catch(() => {});
        } catch (e) {}

        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];
        const user = room.users[socket.id];
        const username = user ? user.username : "Unknown";

        delete room.users[socket.id];

        if (socket.id === room.hostSocketId) {
            const remainingSocketIds = Object.keys(room.users);
            if (remainingSocketIds.length > 0) {
                room.hostSocketId = remainingSocketIds[0];
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

        if (Object.keys(room.users).length === 0) {
            if (debounceTimers[roomId]) {
                clearTimeout(debounceTimers[roomId]);
                delete debounceTimers[roomId];
                try {
                    await prisma.room.update({
                        where: { id: roomId },
                        data: { code: room.code }
                    });
                } catch (e) {}
            }
            delete rooms[roomId];
        }
    });

    socket.on("toggle-lock", async ({ roomId }: { roomId: string }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (room.hostSocketId !== socket.id) {
            return;
        }
        room.isLocked = !room.isLocked;

        io.to(roomId).emit("lock-state-changed", {
            isLocked: room.isLocked,
        });

        try {
            await prisma.room.update({
                where: { id: roomId },
                data: { isLocked: room.isLocked }
            });
        } catch (e) {}
    });

    socket.on("language-change", async ({ roomId, language }: { roomId: string; language: string }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (socket.id !== room.hostSocketId) return;

        room.language = language;
        io.to(roomId).emit("language-update", { language });

        try {
            await prisma.room.update({
                where: { id: roomId },
                data: { language }
            });
        } catch (e) {}
    });

    socket.on(
        "send-message",
        async ({ roomId, username, message }: { roomId: string; username: string; message: string }) => {
            const room = rooms[roomId];
            if (!room) return;

            const chatMessage: ChatMessage = {
                username,
                message,
                timestamp: Date.now(),
                socketId: socket.id,
            };

            room.messages.push(chatMessage);
            if (room.messages.length > 100) {
                room.messages = room.messages.slice(-100);
            }

            io.to(roomId).emit("chat-message", chatMessage);

            try {
                await prisma.message.create({
                    data: {
                        roomId,
                        username,
                        message,
                        socketId: socket.id,
                        timestamp: new Date(chatMessage.timestamp)
                    }
                });
            } catch (error) {
                console.error("Failed to save message to DB:", error);
            }
        }
    );

    socket.on("ping", (callback: unknown) => {
        if (typeof callback === "function") {
            callback();
        }
    });

    // AI Fix Applied - broadcast fixed code to all users in the room
    socket.on("ai-fix-applied", ({ roomId, fixedCode }: { roomId: string; fixedCode: string }) => {
        const room = rooms[roomId];
        if (!room) return;
        // Only allow host or editors to apply fixes
        if (room.isLocked && socket.id !== room.hostSocketId) return;

        room.code = fixedCode;
        io.to(roomId).emit("sync-code", { code: fixedCode });

        // Debounced save to DB
        if (debounceTimers[roomId]) {
            clearTimeout(debounceTimers[roomId]);
        }
        debounceTimers[roomId] = setTimeout(async () => {
            try {
                await prisma.room.update({
                    where: { id: roomId },
                    data: { code: fixedCode }
                });
                log(`Saved AI-fixed code for room ${roomId} to DB.`);
            } catch (error) {
                console.error(`Failed to save AI-fixed code for room ${roomId}:`, error);
            }
        }, 5000);
    });
});

async function startServer() {
    try {
        await prisma.session.deleteMany({});
        log("Cleaned up stale sessions from database.");
    } catch (e) {
        console.error("Failed to clean up stale sessions:", e);
    }
    
    const PORT: number = parseInt(process.env.PORT || "4000", 10);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();
