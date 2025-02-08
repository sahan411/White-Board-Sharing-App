const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");  // Remove the (server) here

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Your frontend Vite default port
        methods: ["GET", "POST"]
    }
});

app.get("/", (req,res) => {
    res.send("This is mern white board web app");
});

io.on("connection", (socket) => {
    socket.on("userJoined", (data) => {
        const { name, userId, roomId, host, presenter } = data;
        socket.join(roomId);
        socket.emit("userJoined", { success: true });
    })
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log("server is running on http://localhost:5000"));