// ops #3202 -- THREE PROFILES WERE REMOVED HERE, and why matters more than
// that they went.
//
//   compliance-check        -> compliance.yml
//   dependency-update       -> dependency-update.yml
//   disaster-recovery-test  -> disaster-recovery.yml
//
// None of those workflows exists, and none ever has. This is not decorative
// config: pipelineOrchestrator.js:151 reads config.workflow and :284 passes it
// to triggerPipeline(), which calls github.actions.createWorkflowDispatch() --
// so dispatching any of them 404s against the GitHub API, deep inside an
// orchestration run rather than at config load.
//
// They were removed rather than repointed because no existing workflow is a
// defensible substitute. rollback.yml is not a disaster-recovery test;
// dependabot-auto-merge.yml merges Dependabot's PRs rather than running an
// update pipeline; nothing here does licence/policy compliance. Repointing
// them would have replaced a loud 404 with a workflow that runs and reports
// success for something it did not do -- strictly worse.
//
// To bring one back: add the workflow first, then re-add the profile. The test
// at api/test/orchestration-profiles.test.js enforces that ordering.
//
// ⚠ Note `compliance-check` also survives as an ACTION name inside
// full-gitops-audit's stages, handled by taskExecutionEngine.js:335. The same
// string is both a profile key and an action; only the PROFILE was removed.

const orchestrationProfiles = {
  'full-gitops-audit': {
    name: 'Full GitOps Audit & Compliance',
    description: 'Complete audit and compliance check across all repositories',
    repositories: 'all',
    applyTemplates: true,
    template: 'standard-devops',
    // ops #3202 -- was 'audit.yml', which is deleted. That workflow ran
    // gitaudit.ps1 WITHOUT GH_REPO_PAT, so the script never fetched or cloned
    // anything and audited an empty `repos/` directory: every daily run was
    // green and reported "Directory 'repos' does not exist. No repositories to
    // audit." Repointed at gitops-audit.yml, which is the workflow that
    // actually performs the audit-and-quality work this profile names.
    //
    // If the intent was specifically the repo-inventory audit rather than code
    // quality, this profile should be removed instead -- nothing has performed
    // that inventory since 2025-10-05.
    workflow: 'gitops-audit.yml',
    stages: [
      {
        name: 'audit',
        parallel: true,
        actions: ['repository-audit', 'compliance-check', 'security-scan']
      },
      {
        name: 'template-sync',
        sequential: true,
        actions: ['apply-missing-templates', 'update-outdated-templates']
      },
      {
        name: 'validation',
        parallel: true,
        actions: ['validate-pipelines', 'check-dependencies']
      }
    ],
    timeout: 45 * 60 * 1000, // 45 minutes
    retryPolicy: {
      maxRetries: 2,
      retryDelay: 5000
    }
  },

  'homelab-deployment': {
    name: 'Homelab Service Deployment',
    description: 'Coordinated deployment of homelab services',
    repositories: [
      'home-assistant-config', 
      'docker-compose-stack', 
      'nginx-config',
      'traefik-config',
      'monitoring-stack'
    ],
    dependencyOrder: [
      'infrastructure-base',
      'core-services', 
      'application-services',
      'monitoring-services'
    ],
    applyTemplates: false,
    workflow: 'deploy.yml',
    stages: [
      {
        name: 'preparation',
        actions: ['backup-current-state', 'validate-configurations']
      },
      {
        name: 'infrastructure',
        sequential: true,
        repositories: ['docker-compose-stack'],
        actions: ['deploy-infrastructure']
      },
      {
        name: 'services',
        dependency_ordered: true,
        actions: ['deploy-services', 'configure-networking']
      },
      {
        name: 'verification',
        parallel: true,
        actions: ['health-checks', 'integration-tests']
      }
    ],
    timeout: 60 * 60 * 1000, // 60 minutes
    rollbackOnFailure: true,
    notifications: {
      onStart: ['admin'],
      onComplete: ['admin', 'operators'],
      onFailure: ['admin', 'oncall']
    }
  },

  'security-hardening': {
    name: 'Security Hardening Pipeline',
    description: 'Apply security templates and run security scans',
    repositories: 'all',
    filters: {
      hasDockerfile: true,
      hasPublicExposure: true,
      tags: ['security', 'public']
    },
    applyTemplates: true,
    template: 'security-hardening',
    workflow: 'security-scan.yml',
    stages: [
      {
        name: 'security-templates',
        sequential: true,
        actions: ['apply-security-templates', 'update-security-policies']
      },
      {
        name: 'scanning',
        parallel: true,
        actions: ['vulnerability-scan', 'dependency-audit', 'secrets-scan', 'container-scan']
      },
      {
        name: 'remediation',
        sequential: true,
        actions: ['apply-security-fixes', 'update-dependencies', 'generate-security-report']
      }
    ],
    timeout: 90 * 60 * 1000, // 90 minutes
    criticalFailureThreshold: 0.1, // Fail if 10% or more repos fail critically
    securityValidation: {
      requireCleanVulnerabilityScan: true,
      requireUpToDateDependencies: true,
      requireSecurityPolicies: true
    }
  },

  'ci-cd-setup': {
    name: 'CI/CD Pipeline Setup',
    description: 'Initialize CI/CD workflows across repositories',
    repositories: 'all',
    filters: {
      missingCICD: true
    },
    applyTemplates: true,
    template: 'github-actions',
    workflow: 'ci.yml',
    stages: [
      {
        name: 'analysis',
        parallel: true,
        actions: ['detect-language', 'analyze-structure', 'identify-dependencies']
      },
      {
        name: 'template-application',
        sequential: true,
        actions: ['apply-ci-templates', 'configure-secrets', 'setup-environments']
      },
      {
        name: 'testing',
        parallel: true,
        actions: ['test-workflows', 'validate-configurations']
      }
    ],
    timeout: 30 * 60 * 1000, // 30 minutes
    autoDetectLanguage: true,
    templateSelection: {
      strategy: 'auto',
      fallback: 'generic'
    }
  },




  'performance-optimization': {
    name: 'Performance Optimization',
    description: 'Analyze and optimize performance across services',
    repositories: 'all',
    filters: {
      hasPerformanceMetrics: true,
      isProduction: true
    },
    applyTemplates: false,
    // ops #3202 -- was 'performance-optimization.yml', which does not exist.
    // performance.yml ("Performance Testing", daily cron) is the workflow that
    // actually does this work: it builds both apps, installs perf tooling and
    // drives the API server under test.
    workflow: 'performance.yml',
    stages: [
      {
        name: 'baseline-measurement',
        parallel: true,
        actions: ['measure-current-performance', 'analyze-bottlenecks', 'profile-resources']
      },
      {
        name: 'optimization',
        sequential: true,
        actions: ['apply-optimizations', 'update-configurations', 'optimize-queries']
      },
      {
        name: 'validation',
        parallel: true,
        actions: ['performance-comparison', 'load-testing', 'regression-testing']
      }
    ],
    timeout: 90 * 60 * 1000, // 90 minutes
    performanceThresholds: {
      responseTime: 200, // ms
      throughput: 1000, // req/sec
      errorRate: 0.1 // %
    }
  }
};

// Helper function to resolve repository lists
function resolveRepositories(config, availableRepos) {
  if (config.repositories === 'all') {
    return availableRepos.filter(repo => {
      if (!config.filters) return true;
      
      // Apply filters
      for (const [filter, value] of Object.entries(config.filters)) {
        switch (filter) {
          case 'hasDockerfile':
            if (value && !repo.hasDockerfile) return false;
            break;
          case 'hasPublicExposure':
            if (value && !repo.isPublic) return false;
            break;
          case 'missingCICD':
            if (value && repo.hasCICD) return false;
            break;
          case 'hasPackageManager':
            if (value && !repo.packageManager) return false;
            break;
          case 'hasPerformanceMetrics':
            if (value && !repo.performanceMetrics) return false;
            break;
          case 'isProduction':
            if (value && repo.environment !== 'production') return false;
            break;
          case 'tags':
            if (Array.isArray(value) && !value.some(tag => repo.tags?.includes(tag))) return false;
            break;
        }
      }
      
      return true;
    }).map(repo => repo.name || repo);
  }
  
  return Array.isArray(config.repositories) ? config.repositories : [config.repositories];
}

// Helper function to validate orchestration configuration
function validateOrchestrationConfig(profileName, customConfig = {}) {
  const profile = orchestrationProfiles[profileName];
  if (!profile) {
    throw new Error(`Unknown orchestration profile: ${profileName}`);
  }
  
  const config = { ...profile, ...customConfig };
  
  // Validate required fields
  if (!config.name) throw new Error('Orchestration name is required');
  if (!config.repositories) throw new Error('Repositories list is required');
  if (!config.stages || !Array.isArray(config.stages)) throw new Error('Stages configuration is required');
  
  // Validate timeout
  if (config.timeout && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new Error('Timeout must be a positive number');
  }
  
  // Validate stages
  for (const stage of config.stages) {
    if (!stage.name) throw new Error('Stage name is required');
    if (!stage.actions || !Array.isArray(stage.actions)) {
      throw new Error(`Stage ${stage.name} must have actions array`);
    }
  }
  
  return config;
}

// Export orchestration profiles and utilities
module.exports = {
  orchestrationProfiles,
  resolveRepositories,
  validateOrchestrationConfig,
  
  // Get all profile names
  getProfileNames: () => Object.keys(orchestrationProfiles),
  
  // Get profile by name
  getProfile: (name) => orchestrationProfiles[name],
  
  // Get profiles by category/tag
  getProfilesByCategory: (category) => {
    return Object.entries(orchestrationProfiles)
      .filter(([name, profile]) => profile.category === category)
      .map(([name, profile]) => ({ name, ...profile }));
  },
  
  // Create custom profile
  createCustomProfile: (name, config) => {
    const validatedConfig = validateOrchestrationConfig(name, config);
    return {
      name,
      description: config.description || `Custom orchestration: ${name}`,
      ...validatedConfig
    };
  }
};