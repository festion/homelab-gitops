// websocket-server.test.js - Unit tests for WebSocket server
const WebSocket = require('ws');
const express = require('express');
const fs = require('fs');
const path = require('path');
const WebSocketManager = require('../websocket-server');

describe('WebSocket Server', () => {
  let app, server, wsManager, testDataPath;
  const TEST_PORT = 3071;

  beforeAll(() => {
    // Setup test environment
    app = express();
    testDataPath = path.join(__dirname, 'test-audit-data.json');

    // Create test audit data
    const testData = {
      timestamp: new Date().toISOString(),
      health_status: "green",
      summary: { total: 2, clean: 2, dirty: 0 },
      repos: [
        { name: "test-repo-1", status: "clean" },
        { name: "test-repo-2", status: "clean" }
      ]
    };
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
  });

  afterAll(() => {
    // Cleanup test data
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }
  });

  beforeEach((done) => {
    server = app.listen(TEST_PORT, () => {
      wsManager = new WebSocketManager(app, testDataPath, {
        maxConnections: 5,
        debounceDelay: 100
      });
      done();
    });
  });

  afterEach((done) => {
    if (wsManager) {
      wsManager.cleanup();
    }
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('should initialize WebSocket server correctly', () => {
    expect(wsManager).toBeDefined();
    expect(wsManager.clients.size).toBe(0);
    expect(wsManager.maxConnections).toBe(5);
  });

  test('should accept WebSocket connections', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);

    ws.on('open', () => {
      expect(wsManager.clients.size).toBe(1);
      ws.close();
    });

    ws.on('close', () => {
      setTimeout(() => {
        expect(wsManager.clients.size).toBe(0);
        done();
      }, 100);
    });
  });

  test('should send current data on connection', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.type).toBe('audit-update');
      expect(message.data).toBeDefined();
      expect(message.data.repos).toHaveLength(2);
      ws.close();
      done();
    });
  });

  test('should reject connections when max limit reached', (done) => {
    const connections = [];
    let rejectedCount = 0;

    // Create max connections
    for (let i = 0; i < 5; i++) {
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);
      connections.push(ws);
    }

    // Try to create one more connection (should be rejected)
    const extraWs = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);

    extraWs.on('close', (code) => {
      expect(code).toBe(1013); // Server overloaded
      rejectedCount++;

      // Cleanup
      connections.forEach(ws => ws.close());

      setTimeout(() => {
        expect(rejectedCount).toBe(1);
        done();
      }, 200);
    });
  });

  test('should broadcast updates when file changes', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);
    let messageCount = 0;

    ws.on('message', (data) => {
      messageCount++;

      if (messageCount === 2) { // First message is initial data, second is update
        const message = JSON.parse(data);
        expect(message.type).toBe('audit-update');
        expect(message.data.repos).toHaveLength(3); // Updated data
        ws.close();
        done();
      }
    });

    ws.on('open', () => {
      // Simulate file change
      setTimeout(() => {
        const updatedData = {
          timestamp: new Date().toISOString(),
          health_status: "yellow",
          summary: { total: 3, clean: 2, dirty: 1 },
          repos: [
            { name: "test-repo-1", status: "clean" },
            { name: "test-repo-2", status: "clean" },
            { name: "test-repo-3", status: "dirty" }
          ]
        };
        fs.writeFileSync(testDataPath, JSON.stringify(updatedData, null, 2));
      }, 100);
    });
  });

  test('should handle client heartbeat', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);

    ws.on('ping', () => {
      ws.pong(); // Respond to ping
    });

    ws.on('open', () => {
      // Wait for heartbeat cycle
      setTimeout(() => {
        expect(wsManager.clients.size).toBe(1);
        // Check that connection is still alive
        const client = Array.from(wsManager.clients)[0];
        expect(client.isAlive).toBe(true);
        ws.close();
        done();
      }, 200);
    });
  });

  test('should handle invalid JSON messages gracefully', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/ws`);

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'error') {
        expect(message.message).toBe('Invalid message format');
        ws.close();
        done();
      }
    });

    ws.on('open', () => {
      // Send invalid JSON
      ws.send('invalid json');
    });
  });
});

describe('WebSocket Health Endpoints', () => {
  let app, server, wsManager, testDataPath;
  const TEST_PORT = 3072;

  beforeAll(() => {
    app = express();
    testDataPath = path.join(__dirname, 'test-audit-data-health.json');

    const testData = { timestamp: new Date().toISOString(), repos: [] };
    fs.writeFileSync(testDataPath, JSON.stringify(testData));
  });

  afterAll(() => {
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }
  });

  beforeEach((done) => {
    server = app.listen(TEST_PORT, () => {
      wsManager = new WebSocketManager(app, testDataPath);
      done();
    });
  });

  afterEach((done) => {
    if (wsManager) {
      wsManager.cleanup();
    }
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('should provide health status endpoint', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/ws/status`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.clients).toBe(0);
    expect(data.maxConnections).toBeDefined();
  });

  test('should provide manual trigger endpoint', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/ws/trigger-update`, {
      method: 'POST'
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Update triggered');
    expect(data.clients).toBe(0);
  });
});
