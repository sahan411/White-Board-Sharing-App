const { parentPort } = require('worker_threads');
const users = [];

parentPort.on('message', (message) => {
  let result;
  
  switch (message.type) {
    case 'addUser':
      result = addUser(message.data);
      parentPort.postMessage({ type: 'userAdded', users: result });
      break;
      
    case 'removeUser':
      result = removeUser(message.data);
      parentPort.postMessage({ 
        type: 'userRemoved', 
        user: result.user,
        roomUsers: result.roomUsers 
      });
      break;
      
    case 'getUser':
      result = getUser(message.data);
      parentPort.postMessage({ type: 'userFound', user: result });
      break;
      
    case 'getUsersInRoom':
      result = getUsersInRoom(message.data);
      parentPort.postMessage({ type: 'roomUsers', users: result });
      break;
  }
});

function addUser({ name, userId, roomId, host, presenter, socketId }) {
  const user = { name, userId, roomId, host, presenter, socketId };
  users.push(user);
  return users.filter(user => user.roomId === roomId);
}

function removeUser(socketId) {
  const index = users.findIndex(user => user.socketId === socketId);
  let user = null;
  let roomUsers = [];
  
  if (index !== -1) {
    user = users.splice(index, 1)[0];
    roomUsers = users.filter(u => u.roomId === user.roomId);
  }
  
  return { user, roomUsers };
}

function getUser(socketId) {
  return users.find(user => user.socketId === socketId);
}

function getUsersInRoom(roomId) {
  return users.filter(user => user.roomId === roomId);
}