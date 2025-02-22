import 'bootstrap/dist/css/bootstrap.min.css'
import Forms from './components/Forms'
import './App.css'
import { data, Route, Routes } from 'react-router-dom'
import RoomPage from './pages/RoomPage'
import { io } from 'socket.io-client'
import { toast, ToastContainer } from 'react-toastify'
import { useState, useEffect, useRef } from 'react'

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
}

const socket = io(server, connectionOptions);

const App = () => {
  // Move the hook inside the component
  const socketWorkerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Initialize socket worker
    if (typeof window !== 'undefined' && window.Worker) {
      socketWorkerRef.current = new Worker('/socketWorker.js');
      
      socketWorkerRef.current.onmessage = (e) => {
        const { type, messages } = e.data;
        
        if (type === 'processedMessages') {
          // Process batch of messages
          messages.forEach(msg => {
            switch (msg.event) {
              case 'userJoined':
                if (msg.data.success) {
                  setUsers(msg.data.users);
                }
                break;
                
              case 'allUsers':
                setUsers(msg.data.users);
                break;
                
              case 'userJoinedMessageBroadcasted':
                toast.info(`${msg.data} joined the room!`);
                break;
                
              case 'userLeftMessageBroadcasted':
                toast.info(`${msg.data} left the room!`);
                break;
            }
          });
        }
      };
    }
    
    // Clean up
    return () => {
      if (socketWorkerRef.current) {
        socketWorkerRef.current.postMessage({ type: 'stop' });
        socketWorkerRef.current.terminate();
      }
    };
  }, []);

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