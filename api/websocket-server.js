// websocket-server.js - Enhanced WebSocket integration with Express.js
// Implementing Gemini-approved architecture with security and performance improvements

const WebSocket = require("ws");
const chokidar = require("chokidar");
const expressWs = require("express-ws");
const fs = require('fs');
const path = require('path');

class WebSocketManager {
  constructor(app, auditDataPath, options = {}) {
    this.app = app;
    this.auditDataPath = auditDataPath;
    this.clients = new Set();
    this.maxConnections = options.maxConnections || 50;
    this.heartbeatInterval = null;
    this.watcher = null;
    this.lastBroadcastTime = 0;
    this.debounceDelay = options.debounceDelay || 1000; // 1 second debounce
    
    console.log(`🔌 WebSocket Manager initialized - Max connections: ${this.maxConnections}`);
    
    this.setupWebSocket();
    this.setupFileWatcher();
    this.setupHeartbeat();
  }

  setupWebSocket() {
    expressWs(this.app);
    
    this.app.ws("/ws", (ws, req) => {
      // Connection limit enforcement (Gemini recommendation)
      if (this.clients.size >= this.maxConnections) {
        console.warn(`⚠️ Connection rejected - max connections (${this.maxConnections}) reached`);
        ws.close(1013, "Server overloaded");
        return;
      }

      // Origin validation (Gemini security recommendation)
      const origin = req.headers.origin;
      if (origin && !this.isValidOrigin(origin)) {
        console.warn(`⚠️ Connection rejected - invalid origin: ${origin}`);
        ws.close(1008, "Invalid origin");
        return;
      }

      this.clients.add(ws);
      ws.isAlive = true;
      
      console.log(`✅ Client connected. Total clients: ${this.clients.size}`);
      
      // Send current data on connection
      this.sendCurrentData(ws);
      
      // Enhanced event handlers with better error management
      ws.on("close", (code, reason) => {
        this.clients.delete(ws);
        console.log(`❌ Client disconnected (${code}). Total clients: ${this.clients.size}`);
      });
      
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });

      // Heartbeat response (Gemini recommendation)
      ws.on('pong', () => { 
        ws.isAlive = true; 
      });

      // Message handling with size limits (Gemini security recommendation)
      ws.on('message', (data) => {
        try {
          // Limit message size to prevent DoS
          if (data.length > 1024) {
            ws.close(1009, "Message too large");
            return;
          }
          
          const message = JSON.parse(data);
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error("Invalid message from client:", error);
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid message format"
          }));
        }
      });
    });

    // Health check endpoint for WebSocket server
    this.app.get('/api/ws/status', (req, res) => {
      res.json({
        status: 'healthy',
        clients: this.clients.size,
        maxConnections: this.maxConnections,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Manual trigger endpoint for testing
    this.app.post('/api/ws/trigger-update', (req, res) => {
      this.broadcastUpdate();
      res.json({
        message: 'Update triggered',
        clients: this.clients.size,
        timestamp: new Date().toISOString()
      });
    });
  }

  isValidOrigin(origin) {
    // Configure allowed origins based on environment
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    return allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development';
  }

  setupFileWatcher() {
    const watchPath = path.resolve(this.auditDataPath);
    
    this.watcher = chokidar.watch(watchPath, {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });
    
    this.watcher.on("change", () => {
      const now = Date.now();
      if (now - this.lastBroadcastTime < this.debounceDelay) {
        return; // Debounce rapid file changes
      }
      
      console.log("📄 Audit data changed, broadcasting update");
      this.broadcastUpdate();
      this.lastBroadcastTime = now;
    });

    this.watcher.on("error", (error) => {
      console.error("❌ File watcher error:", error);
      // Attempt to recreate watcher after delay
      setTimeout(() => {
        console.log("🔄 Attempting to restart file watcher...");
        this.setupFileWatcher();
      }, 5000);
    });

    console.log(`👀 File watcher setup for: ${watchPath}`);
  }

  setupHeartbeat() {
    // Heartbeat mechanism (Gemini recommendation)
    this.heartbeatInterval = setInterval(() => {
      const deadClients = [];
      
      this.clients.forEach(ws => {
        if (!ws.isAlive) {
          deadClients.push(ws);
          return;
        }
        
        ws.isAlive = false;
        try {
          ws.ping();
        } catch (error) {
          console.error("Error sending ping:", error);
          deadClients.push(ws);
        }
      });

      // Clean up dead connections
      deadClients.forEach(ws => {
        ws.terminate();
        this.clients.delete(ws);
      });

      if (deadClients.length > 0) {
        console.log(`🧹 Cleaned up ${deadClients.length} dead connections. Active: ${this.clients.size}`);
      }
    }, 30000); // 30 second intervals
  }

  sendCurrentData(ws) {
    try {
      // Enhanced file loading with validation (Gemini recommendation)
      if (!fs.existsSync(this.auditDataPath)) {
        throw new Error(`Audit data file not found: ${this.auditDataPath}`);
      }

      const rawData = fs.readFileSync(this.auditDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      // Validate data structure before sending (Gemini recommendation)
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid audit data format');
      }

      const message = {
        type: "audit-update",
        data: data,
        timestamp: new Date().toISOString(),
        server: "websocket-v1.2.0"
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log("📤 Current data sent to new client");
      }
    } catch (error) {
      console.error("❌ Error sending current data:", error);
      
      // Send error message to client (Gemini recommendation)
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to load audit data",
          timestamp: new Date().toISOString()
        }));
      }
    }
  }

  broadcastUpdate() {
    if (this.clients.size === 0) {
      console.log("📡 No clients connected, skipping broadcast");
      return;
    }
    
    try {
      // Enhanced file loading with proper error handling
      if (!fs.existsSync(this.auditDataPath)) {
        throw new Error(`Audit data file not found: ${this.auditDataPath}`);
      }

      const rawData = fs.readFileSync(this.auditDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid audit data format');
      }
      
      const message = JSON.stringify({
        type: "audit-update",
        data: data,
        timestamp: new Date().toISOString(),
        server: "websocket-v1.2.0"
      });
      
      let successCount = 0;
      let errorCount = 0;
      
      this.clients.forEach(ws => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error("Error sending to client:", error);
          errorCount++;
        }
      });
      
      console.log(`📡 Broadcast complete - Success: ${successCount}, Errors: ${errorCount}`);
    } catch (error) {
      console.error("❌ Error broadcasting update:", error);
      
      // Send error notification to all clients
      const errorMessage = JSON.stringify({
        type: "error",
        message: "Failed to load updated audit data",
        timestamp: new Date().toISOString()
      });
      
      this.clients.forEach(ws => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(errorMessage);
          }
        } catch (err) {
          console.error("Error sending error message:", err);
        }
      });
    }
  }

  handleClientMessage(ws, message) {
    // Handle incoming messages from clients
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
        
      case 'request-update':
        this.sendCurrentData(ws);
        break;
        
      default:
        console.warn(`Unknown message type: ${message.type}`);
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${message.type}`
        }));
    }
  }

  // Enhanced cleanup method (Gemini recommendation)
  cleanup() {
    console.log("🧹 WebSocket Manager cleanup initiated");
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    
    // Close all client connections gracefully
    this.clients.forEach(ws => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1001, "Server shutting down");
        }
      } catch (error) {
        console.error("Error closing client connection:", error);
      }
    });
    
    this.clients.clear();
    console.log("✅ WebSocket Manager cleanup complete");
  }

  // Monitoring and metrics
  getMetrics() {
    return {
      activeConnections: this.clients.size,
      maxConnections: this.maxConnections,
      watcherActive: this.watcher ? true : false,
      heartbeatActive: this.heartbeatInterval ? true : false,
      lastBroadcastTime: new Date(this.lastBroadcastTime).toISOString(),
      uptime: process.uptime()
    };
  }
}

module.exports = WebSocketManager;