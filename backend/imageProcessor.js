const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
  // Process image data - optimize base64 string
  const processedData = processImage(data.imgURL);
  
  // Send back processed data
  parentPort.postMessage({
    roomId: data.roomId,
    imgURL: processedData
  });
});

function processImage(imgURL) {
  // Simple processing - in a real app you might resize/compress the image
  // This is a placeholder for where you'd implement image optimization
  
  // For example, if this was a data URL, you could:
  // 1. Convert to buffer
  // 2. Resize/compress with sharp or another library
  // 3. Convert back to data URL
  
  return imgURL;
}