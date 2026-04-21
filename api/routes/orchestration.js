const express = require('express');
const router = express.Router();
const PipelineOrchestrator = require('../services/orchestrator/pipelineOrchestrator');
const { 
  orchestrationProfiles, 
  resolveRepositories, 
  validateOrchestrationConfig,
  getProfileNames,
  getProfile
} = require('../config/orchestrationProfiles');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { createLogger } = require('../utils/logger');
const { Permission } = require('../models/user');

const logger = createLogger('orchestration-api');

// Middleware to ensure orchestrator is available
const ensureOrchestrator = (req, res, next) => {
  if (!req.orchestrator) {
    req.orchestrator = new PipelineOrchestrator(req.services || {});
  }
  next();
};

// Get all available orchestration profiles
router.get('/profiles', authenticate, (req, res) => {
  try {
    const profiles = getProfileNames().map(name => {
      const profile = getProfile(name);
      return {
        name,
        displayName: profile.name,
        description: profile.description,
        timeout: profile.timeout,
        repositoryCount: Array.isArray(profile.repositories) 
          ? profile.repositories.length 
          : 'all',
        stages: profile.stages.length,
        category: profile.category || 'general'
      };
    });

    res.json({
      success: true,
      profiles,
      total: profiles.length
    });
  } catch (error) {
    logger.error('Failed to get orchestration profiles', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get specific profile details
router.get('/profiles/:profile', authenticate, (req, res) => {
  try {
    const { profile } = req.params;
    const profileConfig = getProfile(profile);
    
    if (!profileConfig) {
      return res.status(404).json({ 
        success: false, 
        error: 'Profile not found' 
      });
    }

    res.json({
      success: true,
      profile: {
        name: profile,
        ...profileConfig
      }
    });
  } catch (error) {
    logger.error(`Failed to get profile ${req.params.profile}`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Execute orchestration with specific profile
router.post('/execute/:profile', 
  authenticate,
  authorize(Permission.PIPELINE_EXECUTE),
  ensureOrchestrator,
  async (req, res) => {
    try {
      const { profile } = req.params;
      const customConfig = req.body;
      
      if (!orchestrationProfiles[profile]) {
        return res.status(404).json({
          error: 'Profile not found'
        });
      }

      // Validate and merge configuration
      const config = validateOrchestrationConfig(profile, customConfig);
      
      // Resolve repositories if needed
      if (config.repositories === 'all' && req.availableRepositories) {
        config.repositories = resolveRepositories(config, req.availableRepositories);
      }

      logger.info(`Starting orchestration: ${profile}`, {
        profile,
        repositoryCount: Array.isArray(config.repositories) ? config.repositories.length : 'all',
        user: req.user?.id
      });

      // Start orchestration (async)
      const orchestration = await req.orchestrator.orchestratePipeline(config);

      // Emit initial progress event (Vikunja #624 / #667 / B8). The
      // orchestrator itself emits stage transitions via EventEmitter; this
      // is the kickoff.
      const ws = req.services && req.services.websocket;
      if (ws && typeof ws.emit === 'function') {
        try {
          ws.emit('orchestration', 'progress', {
            orchestrationId: orchestration.id,
            stage: (orchestration.stages && orchestration.stages[0] && orchestration.stages[0].name) || 'initial',
            percentComplete: 0,
            timestamp: new Date().toISOString(),
          });
        } catch (wsError) {
          logger.warn('Failed to emit orchestration:progress', wsError);
        }
      }

      // Flat response (Vikunja #624 / #665 Decision 3) — no `success` wrapper.
      res.json({
        orchestrationId: orchestration.id,
        status: orchestration.status,
        profile,
        repositories: Array.isArray(config.repositories) ? config.repositories.length : 'all',
        stages: orchestration.stages.length,
        estimatedDuration: config.timeout || 'unlimited'
      });
    } catch (error) {
      logger.error(`Failed to execute orchestration ${req.params.profile}`, error);
      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Execute custom orchestration
router.post('/execute-custom',
  authenticate,
  authorize(Permission.PIPELINE_EXECUTE),
  ensureOrchestrator,
  validateRequest(['name', 'repositories', 'stages']),
  async (req, res) => {
    try {
      const customConfig = req.body;
      
      // Validate custom configuration
      const config = validateOrchestrationConfig('custom', customConfig);
      
      logger.info(`Starting custom orchestration: ${config.name}`, {
        repositoryCount: Array.isArray(config.repositories) ? config.repositories.length : 'all',
        stages: config.stages.length,
        user: req.user?.id
      });

      const orchestration = await req.orchestrator.orchestratePipeline(config);
      
      res.json({
        success: true,
        orchestrationId: orchestration.id,
        status: orchestration.status,
        name: config.name,
        repositories: Array.isArray(config.repositories) ? config.repositories.length : 'all',
        stages: orchestration.stages.length
      });
    } catch (error) {
      logger.error('Failed to execute custom orchestration', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Get orchestration status
router.get('/status/:orchestrationId', 
  authenticate,
  ensureOrchestrator,
  async (req, res) => {
    try {
      const { orchestrationId } = req.params;
      
      const status = req.orchestrator.getOrchestrationStatus(orchestrationId);

      // Flat response (Vikunja #624 / #665 Decision 3) — no `{success, orchestration}`
      // wrapper. Spread the status object directly and guarantee `orchestrationId`
      // is present at the top level (the status object uses `id` internally).
      res.json({
        orchestrationId: status.id || orchestrationId,
        status: status.status,
        startedAt: status.startedAt,
        completedAt: status.completedAt,
        results: status.results,
        stages: status.stages,
        profile: status.profile,
        error: status.error,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: error.message
        });
      } else {
        logger.error(`Failed to get orchestration status ${req.params.orchestrationId}`, error);
        res.status(500).json({
          error: error.message
        });
      }
    }
  }
);

// List active orchestrations
router.get('/active',
  authenticate,
  ensureOrchestrator,
  (req, res) => {
    try {
      const activeOrchestrations = req.orchestrator.listActiveOrchestrations();
      
      res.json({
        success: true,
        orchestrations: activeOrchestrations,
        count: activeOrchestrations.length
      });
    } catch (error) {
      logger.error('Failed to list active orchestrations', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Cancel orchestration
router.post('/cancel/:orchestrationId',
  authenticate,
  authorize(Permission.PIPELINE_CANCEL),
  ensureOrchestrator,
  async (req, res) => {
    try {
      const { orchestrationId } = req.params;
      
      logger.info(`Cancelling orchestration: ${orchestrationId}`, {
        orchestrationId,
        user: req.user?.id
      });

      const orchestration = await req.orchestrator.cancelOrchestration(orchestrationId);
      
      res.json({
        success: true,
        orchestration: {
          id: orchestration.id,
          status: orchestration.status,
          cancelledAt: orchestration.cancelledAt
        }
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not running')) {
        res.status(404).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        logger.error(`Failed to cancel orchestration ${req.params.orchestrationId}`, error);
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    }
  }
);

// Get orchestration history
router.get('/history',
  authenticate,
  (req, res) => {
    try {
      const { page = 1, limit = 50, status, profile } = req.query;
      
      // This would typically query a database
      // For now, return a mock response
      const history = [];
      
      res.json({
        success: true,
        orchestrations: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
          pages: Math.ceil(history.length / limit)
        },
        filters: {
          status,
          profile
        }
      });
    } catch (error) {
      logger.error('Failed to get orchestration history', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Get orchestration metrics
router.get('/metrics',
  authenticate,
  (req, res) => {
    try {
      const { timeRange = '24h' } = req.query;
      
      // This would typically query metrics from the database
      const metrics = {
        totalOrchestrations: 0,
        successRate: 0,
        averageDuration: 0,
        activeOrchestrations: req.orchestrator ? req.orchestrator.listActiveOrchestrations().length : 0,
        profileUsage: {},
        timeRange
      };
      
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      logger.error('Failed to get orchestration metrics', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Validate orchestration configuration
router.post('/validate',
  authenticate,
  (req, res) => {
    try {
      const { profile, customConfig } = req.body;
      
      if (profile) {
        // Validate profile-based configuration
        const config = validateOrchestrationConfig(profile, customConfig);
        res.json({
          success: true,
          valid: true,
          config: {
            name: config.name,
            repositories: Array.isArray(config.repositories) ? config.repositories.length : 'all',
            stages: config.stages.length,
            estimatedDuration: config.timeout || 'unlimited'
          }
        });
      } else if (customConfig) {
        // Validate custom configuration
        const config = validateOrchestrationConfig('custom', customConfig);
        res.json({
          success: true,
          valid: true,
          config: {
            name: config.name,
            repositories: Array.isArray(config.repositories) ? config.repositories.length : 'all',
            stages: config.stages.length
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Either profile or customConfig must be provided'
        });
      }
    } catch (error) {
      res.json({
        success: true,
        valid: false,
        errors: [error.message]
      });
    }
  }
);

// Get repository suggestions for orchestration
router.get('/repositories/suggest',
  authenticate,
  (req, res) => {
    try {
      const { filter, profile } = req.query;
      
      // This would typically query available repositories
      // For now, return mock suggestions
      const suggestions = [
        'home-assistant-config',
        'docker-compose-stack',
        'nginx-config',
        'monitoring-stack',
        'infrastructure-base'
      ];
      
      res.json({
        success: true,
        repositories: suggestions,
        total: suggestions.length
      });
    } catch (error) {
      logger.error('Failed to get repository suggestions', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

module.exports = router;