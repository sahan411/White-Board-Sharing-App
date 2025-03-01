import { useEffect, useState, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

const WhiteBoard = ({   
    canvasRef,
    ctxRef,
    elements,
    setElements,
    tool,
    color,
    user,
    socket
}) => {
    // Move this hook inside the component
    const [renderTimes, setRenderTimes] = useState([]);
    const lastRenderTime = useRef(performance.now());
    const roughGenerator = rough.generator();
    const [img, setImg] = useState(null);
    const canvasWorkerRef = useRef(null);
    //const [isDrawing, setIsDrawing] = useState(false);

useEffect(() => {
    if (typeof window !== 'undefined' && window.Worker) {
        canvasWorkerRef.current = new Worker('/canvasWorker.js');
        
        canvasWorkerRef.current.onmessage = (e) => {
            const { type, data } = e.data;
            
            if (type === 'drawingProcessed') {
                // Apply processed drawing data
                if (data.type === 'pencil') {
                    setElements(prevElements => 
                        prevElements.map((element, index) => {
                            if (index === prevElements.length - 1) {
                                return data;
                            }
                            return element;
                        })
                    );
                }
            } else if (type === 'imageCompressed') {
                // Use the compressed image data
                if (user?.presenter) {
                    socket.emit("whiteboardData", data);
                }
            }
        };
    }
    
    // Clean up the worker when component unmounts
    return () => {
        if (canvasWorkerRef.current) {
            canvasWorkerRef.current.terminate();
        }
    };
}, [socket, user]);

    /*
    useEffect(() => {
        socket.on("whiteboardData", (data) => {
            setImg(data.imgURL);
        });
    }, []);
    */

    useEffect(() => {
        const now = performance.now();
        const renderTime = now - lastRenderTime.current;
        
        // Only track significant renders (>16ms = frame drop territory)
        if (renderTime > 16) {
          setRenderTimes(prev => [...prev.slice(-19), renderTime]);
        }
        
        lastRenderTime.current = now;
        
        // Log performance stats every 5 seconds
        const intervalId = setInterval(() => {
          if (renderTimes.length > 0) {
            const avgTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
            console.log(`Average render time: ${avgTime.toFixed(2)}ms (${renderTimes.length} samples)`);
          }
        }, 5000);
        
        return () => clearInterval(intervalId);
      }, [elements, renderTimes]);
      
    useEffect(() => {
        // Listen for updated whiteboard image data from the server
        const whiteboardDataHandler = (data) => {
          setImg(data.imgURL);
        };
        socket.on("whiteboardDataResponse", whiteboardDataHandler);
        return () => socket.off("whiteboardDataResponse", whiteboardDataHandler);
      }, [socket]);
    
    if(!user?.presenter){
        return (
            <div
                className="border border-3 border-dark h-100 w-100 overflow-hidden"
                >
                    <img src={img} id="img" alt="Real time white board image" 
                        /*
                        style={{
                            height: window.innerHeight * 2,
                            width: "285%",
                        }
                        }*/
                        style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "contain"
                          }}
                    />
                </div>
        )
    }

    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        const ctx = canvas.getContext("2d");

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        ctxRef.current = ctx;
    }, []);

    /*
    useEffect(() => {
        ctxRef.current.strokeStyle = color;
    }, [color]);
    */
    useEffect(() => {
        // Update the stroke color when color state changes
        if (ctxRef.current) {
          ctxRef.current.strokeStyle = color;
        }
    }, [color, ctxRef]);

    /*
    useEffect(() => {
        const canvas = canvasRef.current;
        // Get the parent's size
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctxRef.current = ctx;
    }, [color]);
    */

    useLayoutEffect(() => {
        if(canvasRef){
            const roughCanvas = rough.canvas(canvasRef.current);
        
            if(elements.length > 0) {
                ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
    
            elements.forEach((element) => {
                // existing drawing code...
                if(element.type === "rect") {
                    roughCanvas.draw(
                        roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height,
                        {
                            stroke: element.stroke,
                            strokeWidth: 5,
                            roughness: 0
                        }
                        )
                    );
                }
                else if(element.type === "pencil") {
                    roughCanvas.linearPath(element.path,
                        {
                            stroke: element.stroke,
                            strokeWidth: 5,
                            roughness: 0
                        }
                    );
                }
                else if(element.type === "line") {
                    roughCanvas.draw(
                        roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height,
                            {
                                stroke: element.stroke,
                                strokeWidth: 5,
                                roughness: 0,
                            }
                        )
                    );
                }
            });
            
            // Use worker for image compression if there are elements to draw
            if (elements.length > 0 && canvasWorkerRef.current && user?.presenter) {
                const canvasImage = canvasRef.current.toDataURL();
                canvasWorkerRef.current.postMessage({
                    type: 'compressImage',
                    data: canvasImage
                });
            } else if (elements.length > 0 && user?.presenter) {
                // Fallback if worker is not available
                const canvasImage = canvasRef.current.toDataURL();
                socket.emit("whiteboardData", canvasImage);
            }
        }
    }, [elements]);


    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        console.log(offsetX, offsetY);

        if(tool === "pencil") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "pencil",
                    offsetX,
                    offsetY,
                    path: [[offsetX, offsetY]],
                    stroke: color,
                },
            ]);
        }

        else if(tool === "line") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "line",
                    offsetX,
                    offsetY,
                    width:offsetX,
                    height:offsetY,
                    stroke: color,
                },
            ])
        }

        else if(tool === "rectangle") {
            setElements((prevElements) => [
                ...prevElements,
                {
                    type: "rect",
                    offsetX,
                    offsetY,
                    width:0,
                    height:0,
                    stroke: color,
                },
            ])
        }
        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
    
        if(isDrawing) {
            if(tool === "pencil") {
                const { path } = elements[elements.length - 1];
                const newPath = [...path, [offsetX, offsetY]];
                
                const updatedElement = {
                    ...elements[elements.length - 1],
                    path: newPath,
                };
                
                // Use worker for path processing if many points
                if (newPath.length > 30 && canvasWorkerRef.current) {
                    canvasWorkerRef.current.postMessage({
                        type: 'processDrawing',
                        data: updatedElement
                    });
                } else {
                    // Direct update for simpler paths
                    setElements((prevElements) => 
                        prevElements.map((element, index) => {  
                            if(index === prevElements.length - 1) {
                                return updatedElement;
                            }
                            return element; 
                        })
                    );
                }
            }
            // Keep existing code for other tools
            else if(tool === "line") {
                setElements((prevElements) => 
                    prevElements.map((element, index) => {  
                        if(index === prevElements.length - 1) {
                            return {
                                ...element, 
                                width: offsetX,
                                height: offsetY,
                            };
                        }
                        return element; 
                    })
                );
            } 
            else if(tool === "rectangle") {
                setElements((prevElements) => 
                    prevElements.map((element, index) => {  
                        if(index === prevElements.length - 1) {
                            return {
                                ...element, 
                                width: offsetX - element.offsetX,
                                height: offsetY - element.offsetY,
                            };
                        }
                        return element; 
                    })
                );
            } 
        }
    };

    const handleMouseUp = (e) => {
        setIsDrawing(false);
    };

    return (
            <div 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="border border-3 border-dark h-100 w-100 overflow-hidden"
            >
                <canvas ref={canvasRef} />
            </div>
  
        );
};

export default WhiteBoard;