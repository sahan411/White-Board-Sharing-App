const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { addUser, getUser, removeUser } = require("./utils/users");
const { Worker } = require('worker_threads');
const path = require("path");
const os = require("os"); 

// Create a worker pool for image processing
const workerPool = [];
const MAX_WORKERS = Math.max(1, os.cpus().length - 1); // Use all but one CPU core

function initWorkerPool() {
  for (let i = 0; i < MAX_WORKERS; i++) {
    const worker = new Worker(path.join(__dirname, 'imageProcessor.js'));
    
    worker.on('message', (result) => {
      // Handle processed results
      if (result.roomId && result.imgURL) {
        io.to(result.roomId).emit("whiteboardDataResponse", {
          imgURL: result.imgURL,
        });
      }
    });
    
    worker.on('error', (err) => {
      console.error('Worker error:', err);
    });
    
    workerPool.push({
      worker,
      busy: false
    });
  }
}

// Function to get available worker
function getAvailableWorker() {
  for (const workerInfo of workerPool) {
    if (!workerInfo.busy) {
      return workerInfo;
    }
  }
  return null;
}

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Your frontend Vite port
        methods: ["GET", "POST"]
    }
});

initWorkerPool();

// Create user management worker
const userWorker = new Worker(path.join(__dirname, 'userWorker.js'));
let userWorkerBusy = false;

// Setup event handlers for user worker
userWorker.on('message', (message) => {
  switch (message.type) {
    case 'userAdded':
      const { users } = message;
      // Process user added event
      break;
      
    case 'userRemoved':
      const { user, roomUsers } = message;
      if (user) {
        io.to(user.roomId).emit("userLeftMessageBroadcasted", user.name);
        io.to(user.roomId).emit("allUsers", { users: roomUsers });
      }
      break;
      
    case 'userFound':
      // Process user found event
      break;
      
    case 'roomUsers':
      // Process room users event
      break;
  }
  
  userWorkerBusy = false;
});

app.get("/", (req, res) => {
    res.send("This is mern white board web app");
});

let roomIdGlobal, imgURLGlobal;

// Listen for new socket connections
io.on("connection", (socket) => {
    // Update userJoined event
socket.on("userJoined", (data) => {
    //these data sent by client
    const { name, userId, roomId, host, presenter } = data;
    //store the roomId globally
    roomIdGlobal = roomId;
    
    //here we add socket to specified room to broadcast 
    socket.join(roomId);

    // Use worker thread for user management
    userWorker.postMessage({
        type: 'addUser',
        data: {name, userId, roomId, host, presenter, socketId: socket.id}
    });
    
    userWorkerBusy = true;
    
    // Temporarily handle locally while waiting for worker
    const tempUsers = addUser({name, userId, roomId, host, presenter, socketId:socket.id });
    
    //send response to client that they succcessfullt joined
    socket.emit("userJoined", { success: true, users: tempUsers });
    
    //broadcast notification to allusers
    socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
    
    //to all users
    socket.broadcast.to(roomId).emit("allUsers", { users: tempUsers });
    
    if (imgURLGlobal) {
        socket.emit("whiteboardDataResponse", { imgURL: imgURLGlobal });
    }
});

// Update disconnect event
socket.on("disconnect", () => {
    // Use worker for disconnection
    userWorker.postMessage({
        type: 'removeUser',
        data: socket.id
    });
    
    userWorkerBusy = true;
    
    // Fallback local handling
    const user = getUser(socket.id);
    if(user){
        removeUser(socket.id);
        socket.broadcast.to(user.roomId).emit("userLeftMessageBroadcasted", user.name);
    }
});



    //listen for disconnections
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
