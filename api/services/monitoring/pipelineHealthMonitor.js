const { createLogger } = require('../../utils/logger');
const { MetricsService } = require('../metrics');
const PipelineAnomalyDetector = require('./pipelineAnomalyDetector');
const { normalizeConfigList } = require('../../utils/configList');

// ops #2656. Kept byte-identical to the list the three sibling services already
// use as their fallback (pipelineService.js:446, pipelineCollector.js:459), so
// a deployment with no MONITORED_REPOSITORIES configured monitors the SAME set
// everywhere rather than four services disagreeing about what "default" means.
const DEFAULT_MONITORED_REPOSITORIES = [
  'homelab-gitops-auditor',
  'home-assistant-config'
];

class PipelineHealthMonitor {
  constructor(services) {
    this.logger = createLogger('PipelineHealthMonitor');
    this.metrics = services.metrics || new MetricsService();
    this.websocket = services.websocket;
    this.alerting = services.alerting;
    // ops #2656. OPTIONAL, unlike PipelineService which throws without it: this
    // class is constructed in several places that pass only metrics/websocket/
    // alerting, and requiring config here would break them. When absent,
    // getConfiguredRepositories() falls back to the env var and then to
    // DEFAULT_MONITORED_REPOSITORIES.
    this.config = services.config || null;
    
    this.healthChecks = new Map();
    this.thresholds = this.loadHealthThresholds();
    this.anomalyDetector = new PipelineAnomalyDetector();
    
    this.monitoringIntervals = {
      healthCheck: null,
      performanceAnalysis: null,
      failurePrediction: null
    };
    
    this.isMonitoring = false;
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('Monitoring already started');
      return;
    }

    this.logger.info('Starting pipeline health monitoring');
    this.isMonitoring = true;

    // Schedule health checks
    this.monitoringIntervals.healthCheck = setInterval(
      () => this.performHealthChecks().catch(err => 
        this.logger.error('Health check failed:', err)
      ), 
      5 * 60 * 1000 // Every 5 minutes
    );

    this.monitoringIntervals.performanceAnalysis = setInterval(
      () => this.analyzePerformanceTrends().catch(err => 
        this.logger.error('Performance analysis failed:', err)
      ), 
      30 * 60 * 1000 // Every 30 minutes
    );

    this.monitoringIntervals.failurePrediction = setInterval(
      () => this.predictFailures().catch(err => 
        this.logger.error('Failure prediction failed:', err)
      ), 
      60 * 60 * 1000 // Every hour
    );
    
    // Initial health check
    await this.performHealthChecks();
    this.logger.info('Pipeline health monitoring started successfully');
  }

  async stopMonitoring() {
    if (!this.isMonitoring) return;

    this.logger.info('Stopping pipeline health monitoring');
    
    // Clear all intervals
    Object.values(this.monitoringIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    
    this.monitoringIntervals = {
      healthCheck: null,
      performanceAnalysis: null,
      failurePrediction: null
    };
    
    this.isMonitoring = false;
    this.logger.info('Pipeline health monitoring stopped');
  }

  async performHealthChecks() {
    const startTime = Date.now();
    this.logger.debug('Starting health checks');
    
    const repositories = await this.getMonitoredRepositories();
    const healthReport = {
      timestamp: new Date(),
      overall: { healthy: 0, warning: 0, critical: 0 },
      repositories: new Map(),
      executionTime: 0
    };

    const healthPromises = repositories.map(async (repo) => {
      try {
        const repoHealth = await this.checkRepositoryHealth(repo);
        healthReport.repositories.set(repo, repoHealth);
        
        // Update overall counts
        healthReport.overall[repoHealth.status]++;
        
        // Check for threshold violations
        await this.checkThresholds(repo, repoHealth);
        
        return { repo, health: repoHealth, success: true };
      } catch (error) {
        this.logger.error(`Health check failed for ${repo}:`, error);
        const errorHealth = {
          status: 'critical',
          score: 0,
          error: error.message,
          checks: {},
          issues: [`Health check failed: ${error.message}`],
          recommendations: ['Check repository configuration and connectivity']
        };
        
        healthReport.repositories.set(repo, errorHealth);
        healthReport.overall.critical++;
        
        return { repo, health: errorHealth, success: false, error };
      }
    });

    await Promise.allSettled(healthPromises);
    
    healthReport.executionTime = Date.now() - startTime;

    // Store health report
    await this.storeHealthReport(healthReport);
    
    // Emit real-time update if WebSocket is available
    if (this.websocket) {
      this.websocket.broadcast('health:update', {
        overall: healthReport.overall,
        timestamp: healthReport.timestamp,
        executionTime: healthReport.executionTime
      });
    }

    this.logger.debug(`Health checks completed in ${healthReport.executionTime}ms`);
    return healthReport;
  }

  async checkRepositoryHealth(repository) {
    const health = {
      repository,
      status: 'healthy',
      score: 100,
      checks: {},
      issues: [],
      recommendations: [],
      lastUpdated: new Date()
    };

    try {
      // Pipeline execution health
      const pipelineHealth = await this.checkPipelineExecutionHealth(repository);
      health.checks.pipeline = pipelineHealth;
      
      // Performance health
      const performanceHealth = await this.checkPerformanceHealth(repository);
      health.checks.performance = performanceHealth;
      
      // Quality health
      const qualityHealth = await this.checkQualityHealth(repository);
      health.checks.quality = qualityHealth;
      
      // Reliability health
      const reliabilityHealth = await this.checkReliabilityHealth(repository);
      health.checks.reliability = reliabilityHealth;
      
      // Calculate overall health score (weighted average)
      const weights = { pipeline: 0.3, performance: 0.25, quality: 0.25, reliability: 0.2 };
      health.score = Object.entries(health.checks).reduce((total, [type, check]) => {
        return total + (check.score * weights[type]);
      }, 0);
      
      // Determine status based on score
      if (health.score >= 90) health.status = 'healthy';
      else if (health.score >= 70) health.status = 'warning';
      else health.status = 'critical';
      
      // Collect issues and recommendations
      for (const check of Object.values(health.checks)) {
        if (check.issues) health.issues.push(...check.issues);
        if (check.recommendations) health.recommendations.push(...check.recommendations);
      }

      // Remove duplicates
      health.issues = [...new Set(health.issues)];
      health.recommendations = [...new Set(health.recommendations)];

    } catch (error) {
      this.logger.error(`Health check failed for repository ${repository}:`, error);
      health.status = 'critical';
      health.score = 0;
      health.issues.push(`Health check error: ${error.message}`);
      health.recommendations.push('Investigate health check connectivity and permissions');
    }

    return health;
  }

  async checkPipelineExecutionHealth(repository) {
    const health = {
      score: 100,
      issues: [],
      recommendations: [],
      metrics: {}
    };

    try {
      const recentRuns = await this.metrics.getPipelineRuns(repository, {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      });

      if (!recentRuns || recentRuns.length === 0) {
        health.score = 20; // Partial score for no recent activity
        health.issues.push('No pipeline runs in the last 7 days');
        health.recommendations.push('Verify pipeline triggers and webhook configuration');
        return health;
      }

      // Success rate analysis
      const successful = recentRuns.filter(run => run.conclusion === 'success').length;
      const successRate = (successful / recentRuns.length) * 100;
      health.metrics.successRate = Math.round(successRate * 100) / 100;
      health.metrics.totalRuns = recentRuns.length;
      health.metrics.successfulRuns = successful;

      if (successRate < this.thresholds.pipeline.minSuccessRate) {
        const penalty = Math.min(50, (this.thresholds.pipeline.minSuccessRate - successRate) * 2);
        health.score -= penalty;
        health.issues.push(`Low success rate: ${successRate.toFixed(1)}% (threshold: ${this.thresholds.pipeline.minSuccessRate}%)`);
        health.recommendations.push('Investigate and resolve failing pipeline steps');
      }

      // Recent failure frequency
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentFailures = recentRuns.filter(run => 
        run.conclusion === 'failure' && 
        new Date(run.completed_at || run.updated_at) > last24Hours
      ).length;
      
      health.metrics.recentFailures = recentFailures;

      if (recentFailures > this.thresholds.pipeline.maxDailyFailures) {
        health.score -= Math.min(30, recentFailures * 5);
        health.issues.push(`High failure frequency: ${recentFailures} failures in last 24h (threshold: ${this.thresholds.pipeline.maxDailyFailures})`);
        health.recommendations.push('Review and fix failing test cases and build steps');
      }

      // Queue time analysis
      const runsWithQueueTime = recentRuns.filter(run => run.queueTime != null);
      if (runsWithQueueTime.length > 0) {
        const avgQueueTime = runsWithQueueTime.reduce((sum, run) => sum + run.queueTime, 0) / runsWithQueueTime.length;
        health.metrics.avgQueueTime = Math.round(avgQueueTime);

        if (avgQueueTime > this.thresholds.pipeline.maxQueueTime) {
          health.score -= 15;
          health.issues.push(`High queue time: ${avgQueueTime.toFixed(0)}s average (threshold: ${this.thresholds.pipeline.maxQueueTime}s)`);
          health.recommendations.push('Consider adding more runners or optimizing workflow scheduling');
        }
      }

    } catch (error) {
      this.logger.error(`Pipeline health check failed for ${repository}:`, error);
      health.score = 0;
      health.issues.push(`Pipeline health check error: ${error.message}`);
      health.recommendations.push('Check pipeline service connectivity');
    }

    return health;
  }

  async checkPerformanceHealth(repository) {
    const health = {
      score: 100,
      issues: [],
      recommendations: [],
      metrics: {}
    };

    try {
      const recentRuns = await this.metrics.getPipelineRuns(repository, {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      });

      if (!recentRuns || recentRuns.length === 0) return health;

      // Duration analysis
      const durations = recentRuns
        .filter(run => run.duration != null && run.duration > 0)
        .map(run => run.duration);
        
      if (durations.length === 0) return health;

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      health.metrics.avgDuration = Math.round(avgDuration);
      health.metrics.maxDuration = Math.round(maxDuration);
      health.metrics.minDuration = Math.round(minDuration);

      if (avgDuration > this.thresholds.performance.maxAvgDuration) {
        health.score -= 25;
        health.issues.push(`Slow average duration: ${avgDuration.toFixed(0)}s (threshold: ${this.thresholds.performance.maxAvgDuration}s)`);
        health.recommendations.push('Optimize build steps, enable caching, and parallelize workflows');
      }

      // Performance trend analysis
      const trend = this.calculatePerformanceTrend(recentRuns);
      health.metrics.performanceTrend = trend;

      if (trend > this.thresholds.performance.maxDegradationRate) {
        health.score -= 20;
        health.issues.push(`Performance degrading: ${(trend * 100).toFixed(1)}% increase over time`);
        health.recommendations.push('Review recent changes affecting build performance');
      }

      // Resource usage (if available)
      try {
        const resourceUsage = await this.getResourceUsage(repository);
        if (resourceUsage) {
          health.metrics.resourceUsage = resourceUsage;
          
          if (resourceUsage.cpu > this.thresholds.performance.maxCpuUsage) {
            health.score -= 15;
            health.issues.push(`High CPU usage: ${resourceUsage.cpu}% (threshold: ${this.thresholds.performance.maxCpuUsage}%)`);
            health.recommendations.push('Optimize CPU-intensive operations and consider resource limits');
          }
        }
      } catch (error) {
        // Resource usage is optional, don't fail the whole check
        this.logger.debug(`Resource usage unavailable for ${repository}:`, error.message);
      }

    } catch (error) {
      this.logger.error(`Performance health check failed for ${repository}:`, error);
      health.score = 50; // Partial failure
      health.issues.push(`Performance check error: ${error.message}`);
    }

    return health;
  }

  async checkQualityHealth(repository) {
    const health = {
      score: 100,
      issues: [],
      recommendations: [],
      metrics: {}
    };

    try {
      const qualityMetrics = await this.metrics.getQualityMetrics(repository);
      
      if (!qualityMetrics) {
        // No quality metrics available - partial score
        health.score = 70;
        health.recommendations.push('Enable quality metrics collection for better monitoring');
        return health;
      }

      health.metrics = { ...qualityMetrics };

      // Test coverage
      if (qualityMetrics.testCoverage != null) {
        if (qualityMetrics.testCoverage < this.thresholds.quality.minTestCoverage) {
          const penalty = Math.min(40, (this.thresholds.quality.minTestCoverage - qualityMetrics.testCoverage) * 2);
          health.score -= penalty;
          health.issues.push(`Low test coverage: ${qualityMetrics.testCoverage}% (threshold: ${this.thresholds.quality.minTestCoverage}%)`);
          health.recommendations.push('Add more unit and integration tests');
        }
      }

      // Code quality scores
      if (qualityMetrics.codeQualityScore != null) {
        if (qualityMetrics.codeQualityScore < this.thresholds.quality.minCodeQuality) {
          health.score -= 25;
          health.issues.push(`Poor code quality: ${qualityMetrics.codeQualityScore}/10 (threshold: ${this.thresholds.quality.minCodeQuality})`);
          health.recommendations.push('Address linting issues, code smells, and technical debt');
        }
      }

      // Security vulnerabilities
      if (qualityMetrics.securityVulnerabilities != null && qualityMetrics.securityVulnerabilities > this.thresholds.quality.maxSecurityVulnerabilities) {
        const penalty = Math.min(50, qualityMetrics.securityVulnerabilities * 10);
        health.score -= penalty;
        health.issues.push(`${qualityMetrics.securityVulnerabilities} security vulnerabilities found`);
        health.recommendations.push('Update dependencies and fix security issues immediately');
      }

      // Technical debt
      if (qualityMetrics.technicalDebt != null && qualityMetrics.technicalDebt > this.thresholds.quality.maxTechnicalDebt) {
        health.score -= 15;
        health.issues.push(`High technical debt: ${qualityMetrics.technicalDebt} hours`);
        health.recommendations.push('Allocate time for technical debt reduction');
      }

    } catch (error) {
      this.logger.error(`Quality health check failed for ${repository}:`, error);
      health.score = 50;
      health.issues.push(`Quality check error: ${error.message}`);
    }

    return health;
  }

  async checkReliabilityHealth(repository) {
    const health = {
      score: 100,
      issues: [],
      recommendations: [],
      metrics: {}
    };

    try {
      const reliabilityMetrics = await this.metrics.getReliabilityMetrics(repository);
      
      if (!reliabilityMetrics) {
        health.score = 80; // Good default if no reliability data
        return health;
      }

      health.metrics = { ...reliabilityMetrics };

      // Flaky test detection
      if (reliabilityMetrics.flakyTests != null && reliabilityMetrics.flakyTests > this.thresholds.reliability.maxFlakyTests) {
        health.score -= Math.min(30, reliabilityMetrics.flakyTests * 5);
        health.issues.push(`${reliabilityMetrics.flakyTests} flaky tests detected (threshold: ${this.thresholds.reliability.maxFlakyTests})`);
        health.recommendations.push('Fix or quarantine flaky tests to improve reliability');
      }

      // Mean time to recovery
      if (reliabilityMetrics.mttr != null && reliabilityMetrics.mttr > this.thresholds.reliability.maxMTTR) {
        health.score -= 25;
        health.issues.push(`High MTTR: ${reliabilityMetrics.mttr} hours (threshold: ${this.thresholds.reliability.maxMTTR}h)`);
        health.recommendations.push('Improve incident response and automated rollback procedures');
      }

      // Deployment frequency
      if (reliabilityMetrics.deploymentFrequency != null && reliabilityMetrics.deploymentFrequency < this.thresholds.reliability.minDeploymentFreq) {
        health.score -= 20;
        health.issues.push(`Low deployment frequency: ${reliabilityMetrics.deploymentFrequency}/week (threshold: ${this.thresholds.reliability.minDeploymentFreq})`);
        health.recommendations.push('Consider more frequent, smaller deployments for better reliability');
      }

      // Change failure rate
      if (reliabilityMetrics.changeFailureRate != null && reliabilityMetrics.changeFailureRate > this.thresholds.reliability.maxChangeFailureRate) {
        health.score -= 20;
        health.issues.push(`High change failure rate: ${reliabilityMetrics.changeFailureRate}% (threshold: ${this.thresholds.reliability.maxChangeFailureRate}%)`);
        health.recommendations.push('Improve testing and review processes');
      }

    } catch (error) {
      this.logger.error(`Reliability health check failed for ${repository}:`, error);
      health.score = 70;
      health.issues.push(`Reliability check error: ${error.message}`);
    }

    return health;
  }

  async analyzePerformanceTrends() {
    this.logger.debug('Starting performance trend analysis');
    
    const repositories = await this.getMonitoredRepositories();
    const trends = new Map();

    const trendPromises = repositories.map(async (repo) => {
      try {
        const trend = await this.analyzePipelineTrend(repo);
        trends.set(repo, trend);

        // Alert on significant degradation
        if (trend.degradation > 0.2) { // 20% degradation
          await this.sendAlert({
            level: 'warning',
            title: 'Pipeline Performance Degradation',
            message: `${repo} pipeline performance has degraded by ${(trend.degradation * 100).toFixed(1)}%`,
            repository: repo,
            trend
          });
        }

        return { repo, trend, success: true };
      } catch (error) {
        this.logger.error(`Trend analysis failed for ${repo}:`, error);
        return { repo, error, success: false };
      }
    });

    await Promise.allSettled(trendPromises);

    this.logger.debug(`Performance trend analysis completed for ${repositories.length} repositories`);
    return trends;
  }

  async predictFailures() {
    this.logger.debug('Starting failure prediction analysis');
    
    const repositories = await this.getMonitoredRepositories();
    const predictions = new Map();

    const predictionPromises = repositories.map(async (repo) => {
      try {
        const prediction = await this.anomalyDetector.predictFailure(repo);
        predictions.set(repo, prediction);

        // Alert on high failure probability
        if (prediction.probability > 0.7) {
          await this.sendAlert({
            level: 'warning',
            title: 'Pipeline Failure Predicted',
            message: `${repo} has a ${(prediction.probability * 100).toFixed(1)}% chance of failure`,
            repository: repo,
            prediction
          });
        }

        return { repo, prediction, success: true };
      } catch (error) {
        this.logger.error(`Failure prediction failed for ${repo}:`, error);
        return { repo, error, success: false };
      }
    });

    await Promise.allSettled(predictionPromises);

    this.logger.debug(`Failure prediction completed for ${repositories.length} repositories`);
    return predictions;
  }

  async checkThresholds(repository, health) {
    if (health.status === 'critical') {
      await this.sendAlert({
        level: 'critical',
        title: 'Pipeline Health Critical',
        message: `${repository} pipeline health is critical (score: ${health.score.toFixed(1)})`,
        repository,
        health,
        issues: health.issues
      });
    } else if (health.status === 'warning' && health.score < 75) {
      await this.sendAlert({
        level: 'warning',
        title: 'Pipeline Health Warning',
        message: `${repository} pipeline health needs attention (score: ${health.score.toFixed(1)})`,
        repository,
        health,
        issues: health.issues
      });
    } else if (this.isBelowMinSuccessRate(health)) {
      // Volume-independent gate: a low-run-count repository can score above
      // both arms above purely because it has too few runs to accumulate
      // enough penalty, even at a 0% success rate. Measured: 3 failing runs
      // score 79.0 and clear the `< 75` cutoff, so nothing alerted at all.
      //
      // ON THE SAME if/else-if CHAIN, deliberately. Appended as a separate
      // block it fired IN ADDITION to the arms above, so a repository that is
      // both `critical` and below minSuccessRate paged twice for one
      // condition — measured at 2 alerts for 50 failing-and-slow runs.
      // ops #2296 on this board is the same class ("repo-security-audit
      // double-pages every dependency CVE"), and alert noise is what gets a
      // channel muted. One condition, one alert.
      //
      // The gap case still reaches here: it is `warning` with score >= 75, so
      // it falls through both arms above.
      const successRate = health.checks.pipeline.metrics.successRate;
      const minSuccessRate = this.thresholds.pipeline.minSuccessRate;
      await this.sendAlert({
        level: 'warning',
        title: 'Pipeline Success Rate Below Threshold',
        message: `${repository} success rate is ${successRate.toFixed(1)}% (threshold: ${minSuccessRate}%)`,
        repository,
        health,
        issues: health.issues
      });
    }
  }

  // Extracted so the chain above stays readable and the null-guard lives in one
  // place. A MISSING successRate must never alert — absent is not zero.
  isBelowMinSuccessRate(health) {
    const successRate = health.checks?.pipeline?.metrics?.successRate;
    return successRate != null
      && successRate < this.thresholds.pipeline.minSuccessRate;
  }

  async sendAlert(alert) {
    try {
      if (this.alerting) {
        await this.alerting.sendAlert(alert);
      } else {
        // Log as warning if no alerting service configured
        this.logger.warn(`Alert: [${alert.level.toUpperCase()}] ${alert.title} - ${alert.message}`);
      }

      // Also emit via WebSocket for real-time notifications
      if (this.websocket) {
        this.websocket.broadcast('alert:new', alert);
      }
    } catch (error) {
      this.logger.error('Failed to send alert:', error);
    }
  }

  async getMonitoredRepositories() {
    try {
      // Try to get from metrics service first
      const repos = await this.metrics.getMonitoredRepositories?.();
      if (repos && repos.length > 0) return repos;

      // Fallback to configured repositories
      return this.getConfiguredRepositories();
    } catch (error) {
      this.logger.error('Failed to get monitored repositories:', error);
      return [];
    }
  }

  async getConfiguredRepositories() {
    // ops #2656. This used to read process.env.MONITORED_REPOSITORIES with NO
    // default, while three sibling services read the same setting through the
    // config system WITH one:
    //   services/pipeline/pipelineService.js:451
    //   services/metrics/collectors/pipelineCollector.js:464
    //   services/compliance/complianceService.js:723
    // That name appears in no deployment config, .env example or ansible role
    // in this repo, so the branch always yielded [] — performHealthChecks()
    // then iterated an empty array, checked nothing, and emitted no alerts.
    // A monitor watching zero repositories is indistinguishable from a healthy
    // estate, and there was no log line for the empty set either.
    //
    // Resolution order: injected config -> env var -> built-in default.
    // The env var is kept because it was the pre-existing escape hatch and
    // removing it would be a silent behaviour change for anyone relying on it.
    let repos;

    if (this.config && typeof this.config.get === 'function') {
      repos = this.config.get('MONITORED_REPOSITORIES', DEFAULT_MONITORED_REPOSITORIES);
    } else if (process.env.MONITORED_REPOSITORIES) {
      repos = process.env.MONITORED_REPOSITORIES.split(',').map(r => r.trim());
    } else {
      repos = DEFAULT_MONITORED_REPOSITORIES;
    }

    // ops #3586: normalise BEFORE the array guard below. config.get() returns
    // a comma-separated STRING whenever the value came from
    // config/settings.conf — loadConfigFile() parses KEY=value text and
    // assigns every value verbatim (config-loader.js:50-82), and the setting
    // is documented as comma-separated in docs/PIPELINE-API.md:241 and
    // docs/COMPLIANCE-API.md:405.
    //
    // Without this, `Array.isArray(repos) ? ... : []` sees a string, is not
    // an array, and yields [] -- so following the documentation makes this
    // monitor watch NOTHING, which is the exact ops #2656 failure arriving
    // through a different door. The three sibling readers normalise via the
    // same helper; leaving this one out would have them disagree about what
    // the estate is, and only once someone actually configures the setting.
    //
    // The array guard stays as a genuine safety net for a non-list, non-string
    // value rather than being the thing that eats a valid one.
    repos = normalizeConfigList(repos);
    repos = Array.isArray(repos) ? repos.filter(Boolean) : [];

    if (repos.length === 0) {
      // The empty set is the dangerous state and it used to be silent. Say so
      // loudly: every downstream health check will now pass by checking nothing.
      this.logger.warn(
        'MONITORED_REPOSITORIES resolved to an EMPTY list — health checks will ' +
        'iterate nothing and report no alerts, which is indistinguishable from ' +
        'a healthy estate. Set MONITORED_REPOSITORIES or inject a config.'
      );
    }

    return repos;
  }

  calculatePerformanceTrend(runs) {
    if (runs.length < 2) return 0;

    // Sort by date
    const sortedRuns = runs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    // Calculate trend using linear regression on durations
    const durations = sortedRuns.filter(r => r.duration).map(r => r.duration);
    if (durations.length < 2) return 0;

    const n = durations.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = durations;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgDuration = sumY / n;

    // Return relative slope (percentage change per data point)
    return avgDuration > 0 ? slope / avgDuration : 0;
  }

  async analyzePipelineTrend(repository) {
    const runs = await this.metrics.getPipelineRuns(repository, {
      since: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
    });

    const trend = this.calculatePerformanceTrend(runs);
    
    return {
      degradation: Math.max(0, trend),
      improvement: Math.max(0, -trend),
      trend,
      dataPoints: runs.length,
      period: '14 days'
    };
  }

  async getResourceUsage(repository) {
    // Placeholder for resource usage data
    // This would integrate with your infrastructure monitoring
    return null;
  }

  async storeHealthReport(report) {
    try {
      // Store in metrics service if available
      if (this.metrics.storeHealthReport) {
        await this.metrics.storeHealthReport(report);
      }
      
      // Log summary
      this.logger.info(`Health report: ${report.overall.healthy} healthy, ${report.overall.warning} warning, ${report.overall.critical} critical`);
    } catch (error) {
      this.logger.error('Failed to store health report:', error);
    }
  }

  loadHealthThresholds() {
    return {
      pipeline: {
        minSuccessRate: parseInt(process.env.HEALTH_MIN_SUCCESS_RATE) || 85, // %
        maxDailyFailures: parseInt(process.env.HEALTH_MAX_DAILY_FAILURES) || 3,
        maxQueueTime: parseInt(process.env.HEALTH_MAX_QUEUE_TIME) || 300 // seconds
      },
      performance: {
        maxAvgDuration: parseInt(process.env.HEALTH_MAX_AVG_DURATION) || 600, // seconds
        maxDegradationRate: parseFloat(process.env.HEALTH_MAX_DEGRADATION) || 0.1, // 10% per period
        maxCpuUsage: parseInt(process.env.HEALTH_MAX_CPU_USAGE) || 80 // %
      },
      quality: {
        minTestCoverage: parseInt(process.env.HEALTH_MIN_TEST_COVERAGE) || 70, // %
        minCodeQuality: parseFloat(process.env.HEALTH_MIN_CODE_QUALITY) || 8.0, // out of 10
        maxSecurityVulnerabilities: parseInt(process.env.HEALTH_MAX_VULNERABILITIES) || 0,
        maxTechnicalDebt: parseInt(process.env.HEALTH_MAX_TECH_DEBT) || 40 // hours
      },
      reliability: {
        maxFlakyTests: parseInt(process.env.HEALTH_MAX_FLAKY_TESTS) || 2,
        maxMTTR: parseInt(process.env.HEALTH_MAX_MTTR) || 4, // hours
        minDeploymentFreq: parseInt(process.env.HEALTH_MIN_DEPLOYMENT_FREQ) || 1, // per week
        maxChangeFailureRate: parseInt(process.env.HEALTH_MAX_CHANGE_FAILURE_RATE) || 15 // %
      }
    };
  }

  // Public API methods
  async getHealthStatus(repository = null) {
    if (repository) {
      return await this.checkRepositoryHealth(repository);
    }
    
    return await this.performHealthChecks();
  }

  async getHealthTrends(repository, timeRange = '7d') {
    return await this.analyzePipelineTrend(repository);
  }

  async getFailurePredictions(repository = null) {
    if (repository) {
      return await this.anomalyDetector.predictFailure(repository);
    }
    
    return await this.predictFailures();
  }

  getThresholds() {
    return { ...this.thresholds };
  }

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.logger.info('Health monitoring thresholds updated');
  }
}

module.exports = PipelineHealthMonitor;