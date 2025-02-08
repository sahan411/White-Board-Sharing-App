import 'bootstrap/dist/css/bootstrap.min.css'
import Forms from './components/Forms'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import RoomPage from './pages/RoomPage'
import { io } from 'socket.io-client'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
    socket.on("userJoined", (data) => {
      if(data.success){
        console.log("iserJoined", data);
      }else{
        console.log("userJoined error");
      }
    });
  })
  const uuid = () => {
    let s4 = () =>{
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  return (
    <div className='container'>
      <Routes>
        <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser}/>} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  )
}

export default App