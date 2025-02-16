import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRoomJoin = (e) => {
    e.preventDefault();
    const roomData = { name, roomId, userId: uuid(), host: false, presenter: false };
    setUser(roomData);
    
    navigate(`/room/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  return (
    <form className="form col-md-12 mt-5">
      <div className="form-group">
        <input 
          type="text" 
          className="form-control my-2" 
          placeholder="Enter Your Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <div className="input-group d-flex align-items-center justify-content-center">
          <input 
            type="text" 
            className="form-control my-2" 
            placeholder="Enter Room Code" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>     
      </div>
      <button 
        type="submit" 
        onClick={handleRoomJoin} 
        className="mt-4 btn btn-primary w-100"
      >
        Join Room
      </button>
    </form>    
  );
};

export default JoinRoomForm;
