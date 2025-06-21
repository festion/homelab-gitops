// websocket-server.js - WebSocket integration with Express.js
const WebSocket = require("ws");
const chokidar = require("chokidar");
const expressWs = require("express-ws");

class WebSocketManager {
  constructor(app, auditDataPath) {
    this.app = app;
    this.auditDataPath = auditDataPath;
    this.clients = new Set();
    this.setupWebSocket();
    this.setupFileWatcher();
  }

  setupWebSocket() {
    expressWs(this.app);

    this.app.ws("/ws", (ws, req) => {
      this.clients.add(ws);
      console.log("Client connected. Total clients:", this.clients.size);

      // Send current data on connection
      this.sendCurrentData(ws);

      ws.on("close", () => {
        this.clients.delete(ws);
        console.log("Client disconnected. Total clients:", this.clients.size);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });
    });
  }

  setupFileWatcher() {
    const watcher = chokidar.watch(this.auditDataPath, {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: true
    });

    watcher.on("change", () => {
      console.log("Audit data changed, broadcasting update");
      this.broadcastUpdate();
    });
  }

  sendCurrentData(ws) {
    try {
      const data = require(this.auditDataPath);
      ws.send(JSON.stringify({
        type: "audit-update",
        data: data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error sending current data:", error);
    }
  }

  broadcastUpdate() {
    if (this.clients.size === 0) return;

    try {
      // Clear require cache to get fresh data
      delete require.cache[require.resolve(this.auditDataPath)];
      const data = require(this.auditDataPath);

      const message = JSON.stringify({
        type: "audit-update",
        data: data,
        timestamp: new Date().toISOString()
      });

      this.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    } catch (error) {
      console.error("Error broadcasting update:", error);
    }
  }
}

module.exports = WebSocketManager;
