const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8998 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected!");
  });
});

console.log("WebSocket server is running on ws://localhost:8998");
