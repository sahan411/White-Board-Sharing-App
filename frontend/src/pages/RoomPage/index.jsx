import React, { useRef, useState } from 'react'
import "./index.css"
import WhiteBoard from '../../components/Whiteboard'

const RoomPage = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [tool, setTool] = useState("pencil");
    const [color, setColor] = useState("black");
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]);

    const undo = () => {
        setHistory((prevHistory) => [
            ...prevHistory, elements[elements.length - 1],
        ]);
        setElements((prevElements) => prevElements.slice(0, prevElements.length - 1));
    }

    const redo = () => {
        setElements((prevElements) => [...prevElements, history[history.length - 1]]); 
        setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
    }
    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillRect = "white";
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
        setElements([]);
    }
    return (
        <div className='row'>
            <h1 className='text-center my-4'>White Board Sharing App <span className='text-primary'>[Users Online : 0] </span></h1>
            <div className='d-flex align-items-center justify-content-center gap-5 my-3'>
                {/* Tools Section */}
                <div className='d-flex align-items-center gap-2'>
                    <div className='d-flex align-items-center gap-3'>
                        <label htmlFor="pencil">Pencil</label>
                        <input 
                            type='radio' 
                            name='tool' 
                            id='pencil' 
                            value='pencil' 
                            className='mt-1'
                            checked={tool === 'pencil'}
                            onChange={(e) => setTool(e.target.value)}
                        />
                    </div>
                    <div className='d-flex align-items-center gap-1'>
                        <label htmlFor="line">Line</label>
                        <input 
                            type='radio' 
                            name='tool' 
                            id='line' 
                            value='line'
                            checked={tool === 'line'}
                            onChange={(e) => setTool(e.target.value)}
                        />
                    </div>
                    <div className='d-flex align-items-center gap-1'>
                        <label htmlFor="rectangle">Rectangle</label>
                        <input 
                            type='radio' 
                            name='tool' 
                            id='rectangle' 
                            value='rectangle'
                            checked={tool === 'rectangle'}
                            onChange={(e) => setTool(e.target.value)}
                        />
                    </div>
                </div>

                {/* Color Selector */}
                <div className='d-flex align-items-center gap-2'>
                    <label htmlFor='color'>Select Color:</label>
                    <input 
                        type='color' 
                        name='color' 
                        className='mt-1 ms-3'
                        id='color' 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className='btn-group'>
                    <button className='btn btn-primary mt-1' 
                    disabled={elements.length===0} onClick={() => undo()}
                    >Undo</button>
                    <button className='btn btn-outline-primary mt-1' disabled={history.length<1}
                    onClick={()=> redo()}>Redo</button>
                </div>
                    <button className='btn btn-danger' onClick={handleClearCanvas}>Clear Canvas</button>
                </div>
            <div className="col-md-10 mx-auto mt-4 canvas-box">
            <WhiteBoard 
                canvasRef={canvasRef} 
                ctxRef={ctxRef} 
                elements={elements} 
                setElements={setElements} 
                tool={tool} 
                color={color}
            />
            </div>
        </div>
    )
}

export default RoomPage