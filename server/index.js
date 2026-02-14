const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const compression = require("compression");

const rooms = require("./roomStore")

const isProd = process.env.NODE_ENV === "production";
const log = (...args) => !isProd && console.log(...args);

const app = express()
app.use(compression());

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: {
            chunkSize: 16 * 1024
        },
        zlibInflateOptions: {
            chunkSize: 16 * 1024
        }
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,
    connectTimeout: 45000
})

app.get("/", (req, res) => {
    res.send("Server is Running")
});

io.on("connection", (socket) => {
    log("a user connected", socket.id)


    //creating a room
    socket.on("join-room", ({ roomId, username }) => {
        log("join-room received:", roomId, username);
        if (socket.data.roomId) return;
        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: {},
                hostSocketId: socket.id,
                code: "// Start coding together...",
                isLocked: false,
                language: "javascript",
                messages: []
            }
        }

        // Store roomId 
        socket.roomId = roomId;

        rooms[roomId].users[socket.id] = {
            username,
            socketId: socket.id
        }

        socket.join(roomId)

        const room = rooms[roomId]
        io.to(socket.id).emit("sync-room", {
            code: room.code,
            language: room.language,
            isLocked: room.isLocked,
            hostSocketId: room.hostSocketId
        })

        // Send chat history to new user
        io.to(socket.id).emit("chat-history", room.messages)

        if (!room.hostSocketId) {
            room.hostSocketId = socket.id;
            io.to(socket.id).emit("host-assigned", { isHost: true });
        } else {
            io.to(socket.id).emit("host-assigned", { isHost: socket.id === room.hostSocketId });
        }


        //userList
        const userList = Object.values(room.users).map((u) => ({
            username: u.username,
            socketId: u.socketId,
            isHost: u.socketId === room.hostSocketId
        }));

        //joining notification
        io.to(roomId).emit("user-joined", {
            username,
            users: userList
        })

        log("join-room received:", roomId, username)

    })

    socket.on("code-change", ({ roomId, code }) => {
        const room = rooms[roomId]
        if (!room) return

        if (room.isLocked && socket.id !== room.hostSocketId) {
            return;
        }

        room.code = code
        socket.to(roomId).emit("sync-code", { code })
    })

    socket.on("disconnect", () => {
        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];
        const user = room.users[socket.id];
        const username = user ? user.username : "Unknown";
        // Remove user
        delete room.users[socket.id];
        if (socket.id === room.hostSocketId) {
            const remaningsocketIds = Object.keys(room.users);
            if (remaningsocketIds.length > 0) {
                room.hostSocketId = remaningsocketIds[0];
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
            isHost: u.socketId === room.hostSocketId
        }));

        io.to(roomId).emit("user-left", {
            username,
            users: userList
        });

        // Clean up
        if (Object.keys(room.users).length === 0) {
            delete rooms[roomId];
        }
    });


    socket.on("toggle-lock", ({ roomId }) => {
        const room = rooms[roomId]
        if (!room) return

        if (room.hostSocketId !== socket.id) {
            log("only host can lock the room")
            return
        }
        room.isLocked = !room.isLocked

        log("room :",
            roomId,
            room.isLocked ? "Locked" : "Unlocked"
        )

        io.to(roomId).emit("lock-state-changed", {
            isLocked: room.isLocked
        })
    })

    socket.on("language-change", ({ roomId, language }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (socket.id !== room.hostSocketId) return;

        room.language = language;

        io.to(roomId).emit("language-update", { language });
    });

    // Chat message handling
    socket.on("send-message", ({ roomId, username, message }) => {
        const room = rooms[roomId];
        if (!room) return;

        const chatMessage = {
            username,
            message,
            timestamp: Date.now(),
            socketId: socket.id
        };

        // Store message in room history (limit to last 100 messages)
        room.messages.push(chatMessage);
        if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100);
        }

        // Broadcast to all users in the room
        io.to(roomId).emit("chat-message", chatMessage);
        log("Chat message sent:", username, message);
    });

    socket.on("ping", (callback) => {
        if (typeof callback === "function") {
            callback();
        }
    });

})


const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

