const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const rooms = require("./roomStore")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

app.get("/", (req, res) => {
    res.send("Server is Running")
});

io.on("connection", (socket) => {
    console.log("a user connected", socket.id)


    //creating a room
    socket.on("join-room", ({ roomId, username }) => {
        console.log("join-room received:", roomId, username);
        if (socket.data.roomId) return;
        // Init room if not exists
        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: {},
                hostSocketId: socket.id,
                code: "// Start coding together...", // default code
                isLocked: false,
                language: "javascript"
            }
        }

        // Store roomId on socket for faster disconnect lookup
        socket.roomId = roomId;

        rooms[roomId].users[socket.id] = {
            username,
            socketId: socket.id
        }

        socket.join(roomId)

        const room = rooms[roomId]

        //sync existing code
        io.to(socket.id).emit("sync-code", {
            code: room.code
        })

        //Sync lock state
        io.to(socket.id).emit("lock-state-changed", {
            isLocked: room.isLocked
        })

        if (!room.hostSocketId) {
            room.hostSocketId = socket.id;
            io.to(socket.id).emit("host-assigned", { isHost: true });
        } else {
            // Tell this specific user if they are host
            io.to(socket.id).emit("host-assigned", { isHost: socket.id === room.hostSocketId });
        }


        //userList with metadata
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

        console.log("join-room received:", roomId, username)

    })

    socket.on("code-change", ({ roomId, code }) => {
        const room = rooms[roomId]
        if (!room) return

        if (room.isLocked && socket.id !== room.hostSocketId) {
            return;
        }

        room.code = code
        // broadcast to others
        socket.to(roomId).emit("sync-code", { code })
    })

    socket.on("disconnect", () => {
        // Efficient lookup using stored roomId
        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];
        const user = room.users[socket.id];
        const username = user ? user.username : "Unknown";

        // Remove user
        delete room.users[socket.id];

        // If host left, assign new host
        if (socket.id === room.hostSocketId) {
            const remaningsocketIds = Object.keys(room.users);
            if (remaningsocketIds.length > 0) {
                room.hostSocketId = remaningsocketIds[0];
                console.log("new host assigned:", room.hostSocketId);
                // Notification for the new host can be added here if needed
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

        // Clean up empty room
        if (Object.keys(room.users).length === 0) {
            delete rooms[roomId];
        }
    });


    socket.on("toggle-lock", ({ roomId }) => {
        const room = rooms[roomId]
        if (!room) return

        if (room.hostSocketId !== socket.id) {
            console.log("only host can lock the room")
            return
        }
        room.isLocked = !room.isLocked

        console.log("room :",
            roomId,
            room.isLocked ? "Locked" : "Unlocked"
        )

        io.to(roomId).emit("lock-state-changed", {
            isLocked: room.isLocked
        })
    })

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

