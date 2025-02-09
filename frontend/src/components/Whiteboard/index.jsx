import { use } from "react";
import { useEffect, useState, useLayoutEffect } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

const roughGenerator = rough.generator();
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

    const [img, setImg] = useState(null);

    useEffect(() => {
        socket.on("whiteboardData", (data) => {
            setImg(data.imgURL);
        });
    }, []);
    
    if(!user?.presenter){
        return (
            <div
                className="border border-3 border-dark h-100 w-100 overflow-hidden"
                >
                    <img src={img} id="img" alt="Real time white board image" 
                        style={{
                            height: window.innerHeight * 2,
                            width: "285%",
                        }
                        }
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

    
    useEffect(() => {
        ctxRef.current.strokeStyle = color;
    }, [color]);
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
                        roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height)
                    );
                }
            });
            const canvasImage = canvasRef.current.toDataURL();  
            socket.emit("whiteboardData", canvasImage);
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

                setElements((prevElements) => 
                    prevElements.map((element, index) => {  
                        if(index === prevElements.length - 1) {
                            return {
                                ...element, 
                                path: newPath,
                            };
                        }
                        return element; 
                    })
                );
            }

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