const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { addUser, getUser, removeUser } = require("./utils/users");

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
        const users = addUser({name, userId, roomId, host, presenter, socketId:socket.id });
        socket.emit("userJoined", { success: true, users: users });
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
        socket.broadcast.to(roomId).emit("allUsers", { users });
        //socket.broadcast.to(roomId).emit("whiteboardDataResponse", { imgURL: imgURLGlobal,});
        if (imgURLGlobal) {
            socket.emit("whiteboardDataResponse", { imgURL: imgURLGlobal });
          }
    });


    socket.on("whiteboardData", (data) => {
        imgURLGlobal = data;
        socket.broadcast.to(roomIdGlobal).emit("whiteboardDataResponse", {
            imgURL: imgURLGlobal,
        });
    });


    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if(user){
            removeUser(socket.id);
            //changed here
            //socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", user.name);
            socket.broadcast.to(user.roomId).emit("userLeftMessageBroadcasted", user.name);
        }
    });     
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log("server is running on http://localhost:5000"));
