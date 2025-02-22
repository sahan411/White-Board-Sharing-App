// Socket message processing worker
let pendingMessages = [];
let processingInterval = null;

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  if (type === 'socketMessage') {
    // Queue incoming socket message
    pendingMessages.push(data);
    
    // Start processing if not already running
    if (!processingInterval) {
      processingInterval = setInterval(processMessages, 50);
    }
  }
  else if (type === 'stop') {
    if (processingInterval) {
      clearInterval(processingInterval);
      processingInterval = null;
    }
  }
};

function processMessages() {
  if (pendingMessages.length === 0) {
    // Stop interval if no messages
    if (processingInterval) {
      clearInterval(processingInterval);
      processingInterval = null;
    }
    return;
  }
  
  // Process a batch of messages
  const batch = pendingMessages.splice(0, Math.min(5, pendingMessages.length));
  self.postMessage({ type: 'processedMessages', messages: batch });
}