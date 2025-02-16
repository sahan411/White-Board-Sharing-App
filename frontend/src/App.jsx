import 'bootstrap/dist/css/bootstrap.min.css'
import Forms from './components/Forms'
import './App.css'
import { data, Route, Routes } from 'react-router-dom'
import RoomPage from './pages/RoomPage'
import { io } from 'socket.io-client'
import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
}

const socket = io(server, connectionOptions);

const App = () => {

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("userJoined", (data) => {
      if(data.success){
        console.log("userJoined", data);
        setUsers(data.users); 
      }else{
        console.log("userJoined error");
      }
    });
    

    socket.on("allUsers", (data) => {
      setUsers(data.users);
    });

    socket.on("userJoinedMessageBroadcasted", (data) => {
      //console.log(`${data} joined the room!`);
      toast.info(`${data} joined the room!`);
    });   

    socket.on("userLeftMessageBroadcasted", (data) => {
      //console.log(`${data} left the room!`);
      toast.info(`${data} left the room!`);
    })

  }, [])

  const uuid = () => {
    let s4 = () =>{
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  return (
    <div className='container'>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser}/>} />
        <Route path="/room/:roomId" element={<RoomPage user={user} socket={socket} users={users} />}/>
      </Routes>
    </div>
  )
}

export default App