// File: server.js
// Thin bootstrap: construct services, hand them to createApp(), and listen.
// All middleware + route wiring lives in api/createApp.js.

const path = require('path');
const ConfigLoader = require('./config-loader');

const WebSocketManager = require('./websocket-server');
const WebhookHandler = require('./services/webhook-handler');

const Database = require('./models/database');
const AuthService = require('./services/auth/authService');

const WikiAgentManager = require('./wiki-agent-manager');
const wikiRoutes = require('./routes/wiki');

const SecurityMiddleware = require('./middleware/security');
const { createApp } = require('./createApp');

const config = new ConfigLoader();

// Parse command line arguments for port.
const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith('--port='));
const portFromArg = portArg ? parseInt(portArg.split('=')[1], 10) : null;

const isDev = process.env.NODE_ENV !== 'production';
const rootDir = isDev ? path.resolve(__dirname, '..') : '/opt/gitops';
const PORT = portFromArg || process.env.PORT || 3070;
const HISTORY_DIR = path.join(rootDir, 'audit-history');
const LOCAL_DIR = isDev ? '/mnt/c/GIT' : '/mnt/c/GIT';

// Build the app (services wired in below as they come up).
const app = createApp({
  config,
  rootDir,
  historyDir: HISTORY_DIR,
  localDir: LOCAL_DIR,
  isDev,
  wikiRoutes,
});

// Initialize authentication system — constructs AuthService and pins it to
// app.locals after the db singleton is ready.
async function initializeAuth() {
  try {
    const db = Database.getInstance();
    await db.connect();
    await db.initializeSchema();
    await db.createDefaultAdmin();
    app.locals.authService = new AuthService({ db });
    console.log('Authentication system initialized');
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
    process.exit(1);
  }
}

// Initialize WikiJS Agent Manager and pin to app.locals.
async function initializeWikiAgent() {
  try {
    const wikiAgentManager = new WikiAgentManager(config, rootDir);
    await wikiAgentManager.initialize();
    app.locals.wikiAgentManager = wikiAgentManager;
    console.log('WikiJS Agent Manager initialized');
  } catch (error) {
    console.error('Failed to initialize WikiJS Agent Manager:', error);
    // Don't exit — wiki functionality is optional.
  }
}

const auditDataPath = isDev
  ? path.join(rootDir, 'dashboard/public/GitRepoReport.json')
  : '/opt/gitops/dashboard/GitRepoReport.json';

let wsManager;

async function startServer() {
  try {
    await initializeAuth();
    await initializeWikiAgent();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔧 GitOps Audit API running on port ${PORT}`);
      console.log(`📋 Configuration loaded successfully`);
      console.log(`🔐 Authentication system ready`);

      // Initialize WebSocket after server starts.
      try {
        wsManager = new WebSocketManager(app, auditDataPath, {
          maxConnections: 50,
          debounceDelay: 1000,
        });
        app.locals.wsManager = wsManager;
        console.log(`🔌 WebSocket server initialized - watching: ${auditDataPath}`);
      } catch (error) {
        console.error(`❌ Failed to initialize WebSocket server:`, error);
      }

      // Initialize GitHub Webhook Handler.
      try {
        const webhookHandler = new WebhookHandler({
          secret: process.env.GITHUB_WEBHOOK_SECRET,
          websocketService: wsManager,
        });

        app.locals.webhookHandler = webhookHandler;

        // Attach the webhook middleware. The raw-body pre-middleware is
        // registered inside createApp; this mounts the handler itself.
        // Rate limit added for Vikunja #669 (CodeQL js/missing-rate-limiting);
        // signature verification inside webhookHandler still gates authenticity.
        app.use('/api/v2/webhooks/github', SecurityMiddleware.sensitiveRateLimit(), webhookHandler.middleware());

        webhookHandler.on('push_event', (event) => {
          if (wsManager) {
            wsManager.broadcastUpdate({ type: 'webhook', eventType: 'push', data: event });
          }
        });

        webhookHandler.on('workflow_run_event', (event) => {
          if (wsManager) {
            wsManager.broadcastUpdate({ type: 'webhook', eventType: 'workflow_run', data: event });
          }
        });

        webhookHandler.on('pull_request_event', (event) => {
          if (wsManager) {
            wsManager.broadcastUpdate({ type: 'webhook', eventType: 'pull_request', data: event });
          }
        });

        webhookHandler.on('audit_refresh_needed', (event) => {
          if (wsManager) {
            wsManager.broadcastUpdate({ type: 'audit_refresh', data: event });
          }
        });

        console.log(`🪝 GitHub webhook handler initialized - endpoint: /api/v2/webhooks/github`);
      } catch (error) {
        console.error(`❌ Failed to initialize webhook handler:`, error);
      }

      if (config.getBoolean('ENABLE_VERBOSE_LOGGING')) {
        config.display();
      }

      if (isDev) {
        console.log(`📍 Development mode - API: ${config.getApiUrl(true)}`);
        console.log(`📍 Dashboard: ${config.getDashboardUrl(true)}`);
        console.log(`📁 Local Git Root: ${config.get('LOCAL_GIT_ROOT')}`);
        console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
      } else {
        console.log(`📍 Production mode - API: ${config.getApiUrl(false)}`);
        console.log(`📍 Dashboard: ${config.getDashboardUrl(false)}`);
        console.log(`📁 Local Git Root: ${config.get('LOCAL_GIT_ROOT')}`);
        console.log(`🔌 WebSocket: ws://0.0.0.0:${PORT}/ws`);
      }
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer().then(server => {
  const shutdown = (signal) => {
    console.log(`📊 ${signal} received, shutting down gracefully`);
    if (wsManager) {
      wsManager.cleanup();
    }
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
