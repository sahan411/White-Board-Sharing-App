self.onmessage = function(e) {
    const { type, data } = e.data;
    
    if (type === 'processDrawing') {
      // Process drawing operations
      const processedData = processDrawingData(data);
      self.postMessage({ type: 'drawingProcessed', data: processedData });
    } 
    else if (type === 'compressImage') {
      // Compress image data
      const compressedImage = compressImageData(data);
      self.postMessage({ type: 'imageCompressed', data: compressedImage });
    }
  };
  
  function processDrawingData(drawingData) {
    // Handle vector path optimization - simplify paths with many points
    if (drawingData.type === 'pencil' && drawingData.path) {
      // Simplify path by removing redundant points
      if (drawingData.path.length > 50) {
        const simplifiedPath = [];
        for (let i = 0; i < drawingData.path.length; i += 3) {
          simplifiedPath.push(drawingData.path[i]);
        }
        drawingData.path = simplifiedPath;
      }
    }
    
    return drawingData;
  }
  
  function compressImageData(imageData) {
    // Base64 image optimization could be done here
    // For now, we're just passing through the data
    return imageData;
  }