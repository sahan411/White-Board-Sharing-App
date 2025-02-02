import React, { useState } from 'react'
import "./index.css"
import WhiteBoard from '../../components/Whiteboard'

const RoomPage = () => {
    const [tool, setTool] = useState("pencil")
    const [color, setColor] = useState("black")

    return (
        <div>
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
                        id='color' 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className='btn-group'>
                    <button className='btn btn-primary'>Undo</button>
                    <button className='btn btn-outline-primary'>Redo</button>
                </div>
                    <button className='btn btn-danger'>Clear Canvas</button>
                </div>
            <div className="col-md-10 mx-auto mt-4 canvas-box">
                <WhiteBoard />
            </div>
        </div>
    )
}

export default RoomPage