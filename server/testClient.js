const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Socket connected to server");
  console.log("Socket ID:", socket.id);

  socket.emit("join-room", {
    roomId: "test",
    username: "test-client"
  });
});

socket.on("user-joined", (data) => {
  console.log("user-joined", data);
});

socket.on("user-left", (data) => {
  console.log("user-left", data);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});
