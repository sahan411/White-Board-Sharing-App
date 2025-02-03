import { useEffect, useState } from "react";
import rough from "roughjs";

const roughGenerator = rough.generator();
const WhiteBoard = ({   
    canvasRef,
    ctxRef,
    elements,
    setElements
}) => {
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;
    }, []);

    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        console.log(offsetX, offsetY);

        setElements((prevElements) => [
            ...prevElements,
            {
                type: "circle",
                offsetX,
                offsetY,
                path: [[offsetX, offsetY]],
                stroke: "black",
            },
        ]);

        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if(isDrawing) {
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
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    return (
        <>
            {JSON.stringify(elements)}
            <canvas 
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="border border-3 border-dark h-100 w-100"
            />
        </>
    );
};

export default WhiteBoard;