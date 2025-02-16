const users = [];

const addUser = ({ name, userId, roomId, host, presenter, socketId }) => {
    const user = { name, userId, roomId, host, presenter, socketId };
    users.push(user);
    return users.filter(user => user.roomId === roomId);
}

const removeUser = (userId) => {
    const index = users.findIndex(user => user.socketId === userId);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (userId) => {
    return users.find(user => user.socketId === userId);
}

const getUsersInRoom = (roomId) => {
    return users.filter(user => user.roomId === roomId);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}