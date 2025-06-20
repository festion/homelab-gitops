// Configuration loader for Node.js
const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    const projectRoot = path.resolve(__dirname, '..');
    const configFile = path.join(projectRoot, 'config', 'settings.conf');
    const userConfigFile = path.join(projectRoot, 'config', 'settings.local.conf');
    
    // Set defaults
    this.config = {
      PRODUCTION_SERVER_IP: '192.168.1.58',
      PRODUCTION_SERVER_USER: 'root',
      PRODUCTION_SERVER_PORT: '22',
      PRODUCTION_BASE_PATH: '/opt/gitops',
      LOCAL_GIT_ROOT: '/mnt/c/GIT',
      DEVELOPMENT_API_PORT: '3070',
      DEVELOPMENT_DASHBOARD_PORT: '5173',
      GITHUB_USER: 'festion',
      DASHBOARD_TITLE: 'GitOps Audit Dashboard',
      AUTO_REFRESH_INTERVAL: '30000',
      AUDIT_SCHEDULE: '0 3 * * *',
      MAX_AUDIT_HISTORY: '30',
      ENABLE_AUTO_MITIGATION: 'false',
      LOG_LEVEL: 'INFO',
      LOG_RETENTION_DAYS: '7',
      ENABLE_VERBOSE_LOGGING: 'false',
      ALLOWED_ORIGINS: '*'
    };

    // Load main config file
    this.loadConfigFile(configFile);
    
    // Load user overrides
    this.loadConfigFile(userConfigFile);
    
    // Override with environment variables
    this.loadEnvironmentVariables();
  }

  loadConfigFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || line.trim() === '') {
          continue;
        }
        
        // Parse key=value pairs
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (match) {
          const key = match[1];
          let value = match[2];
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          this.config[key] = value;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not load config file ${filePath}:`, error.message);
    }
  }

  loadEnvironmentVariables() {
    // Override config with environment variables if they exist
    for (const key in this.config) {
      if (process.env[key]) {
        this.config[key] = process.env[key];
      }
    }
  }

  get(key, defaultValue = null) {
    return this.config[key] || defaultValue;
  }

  getBoolean(key, defaultValue = false) {
    const value = this.get(key, defaultValue.toString());
    return value.toLowerCase() === 'true';
  }

  getNumber(key, defaultValue = 0) {
    const value = this.get(key, defaultValue.toString());
    return parseInt(value, 10) || defaultValue;
  }

  getAll() {
    return { ...this.config };
  }

  // Generate URLs based on environment
  getApiUrl(isDev = false) {
    if (isDev) {
      return `http://localhost:${this.get('DEVELOPMENT_API_PORT')}`;
    } else {
      return `http://${this.get('PRODUCTION_SERVER_IP')}:${this.get('DEVELOPMENT_API_PORT')}`;
    }
  }

  getDashboardUrl(isDev = false) {
    if (isDev) {
      return `http://localhost:${this.get('DEVELOPMENT_DASHBOARD_PORT')}`;
    } else {
      return `http://${this.get('PRODUCTION_SERVER_IP')}`;
    }
  }

  // Validate configuration
  validate() {
    const errors = [];
    
    // Check required fields
    const required = ['GITHUB_USER', 'LOCAL_GIT_ROOT', 'PRODUCTION_SERVER_IP'];
    for (const field of required) {
      if (!this.get(field)) {
        errors.push(`Missing required configuration: ${field}`);
      }
    }
    
    // Validate ports
    const apiPort = this.getNumber('DEVELOPMENT_API_PORT');
    const dashboardPort = this.getNumber('DEVELOPMENT_DASHBOARD_PORT');
    
    if (apiPort < 1 || apiPort > 65535) {
      errors.push(`Invalid API port: ${apiPort}`);
    }
    
    if (dashboardPort < 1 || dashboardPort > 65535) {
      errors.push(`Invalid dashboard port: ${dashboardPort}`);
    }
    
    // Check if LOCAL_GIT_ROOT exists
    if (!fs.existsSync(this.get('LOCAL_GIT_ROOT'))) {
      errors.push(`Local Git root directory does not exist: ${this.get('LOCAL_GIT_ROOT')}`);
    }
    
    return errors;
  }

  // Display current configuration
  display() {
    console.log('📋 Current GitOps Auditor Configuration:');
    console.log('');
    console.log('🖥️  Production Server:');
    console.log(`   IP Address: ${this.get('PRODUCTION_SERVER_IP')}`);
    console.log(`   User: ${this.get('PRODUCTION_SERVER_USER')}`);
    console.log(`   Base Path: ${this.get('PRODUCTION_BASE_PATH')}`);
    console.log('');
    console.log('💻 Development Environment:');
    console.log(`   Local Git Root: ${this.get('LOCAL_GIT_ROOT')}`);
    console.log(`   API Port: ${this.get('DEVELOPMENT_API_PORT')}`);
    console.log(`   Dashboard Port: ${this.get('DEVELOPMENT_DASHBOARD_PORT')}`);
    console.log('');
    console.log('🐙 GitHub Configuration:');
    console.log(`   User: ${this.get('GITHUB_USER')}`);
    console.log('');
    console.log('🌐 URLs:');
    console.log(`   Production Dashboard: ${this.getDashboardUrl(false)}`);
    console.log(`   Development Dashboard: ${this.getDashboardUrl(true)}`);
    console.log(`   API Endpoint: ${this.getApiUrl(false)}`);
  }
}

module.exports = ConfigLoader;