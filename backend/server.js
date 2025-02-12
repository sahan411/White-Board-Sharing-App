const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { addUser } = require("./utils/users");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Your frontend Vite port
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
    res.send("This is mern white board web app");
});

let roomIdGlobal, imgURLGlobal;

io.on("connection", (socket) => {
    socket.on("userJoined", (data) => {
        const { name, userId, roomId, host, presenter } = data;
        roomIdGlobal = roomId;
        socket.join(roomId);
        const users = addUser(data);
        socket.emit("userJoined", { success: true}, users);
        socket.broadcast.to(roomId).emit("allUsers", { users });
        socket.broadcast.to(roomId).emit("whiteboardDataResponse", { imgURL: imgURLGlobal,});
    });

    socket.on("whiteboardData", (data) => {
        imgURLGlobal = data;
        socket.broadcast.to(roomIdGlobal).emit("whiteboardDataResponse", {
            imgURL: imgURLGlobal,
        });
    });

});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log("server is running on http://localhost:5000"));
