// ops #3512 follow-up: MONITORED_REPOSITORIES is documented (docs/PIPELINE-API.md,
// docs/COMPLIANCE-API.md) as a comma-separated STRING when set via
// config/settings.conf or config/settings.local.conf, but three readers treated
// whatever config.get() returned as an array already. A string default from a
// conf file would iterate one character at a time instead of one repo at a time.
// Each test here uses a string with irregular whitespace and a trailing
// separator to prove the normalisation actually splits/trims/drops empties,
// not just happens to pass on a tidy fixture.

const { createFakeConfig } = require('../fakes');
const PipelineService = require('../../services/pipeline/pipelineService');
const PipelineCollector = require('../../services/metrics/collectors/pipelineCollector');
const ComplianceService = require('../../services/compliance/complianceService');
const PipelineHealthMonitor = require('../../services/monitoring/pipelineHealthMonitor');
const { createFakeTemplateEngine } = require('../fakes/templateEngine');

const RAW = 'repo-a, repo-b ,repo-c,';
const EXPECTED = ['repo-a', 'repo-b', 'repo-c'];

describe('MONITORED_REPOSITORIES string-vs-array normalisation', () => {
  it('PipelineService.getMonitoredRepositories splits a comma-separated string config value', async () => {
    const config = createFakeConfig({ MONITORED_REPOSITORIES: RAW });
    const service = new PipelineService({ config });

    const result = await service.getMonitoredRepositories();

    expect(result).toEqual(EXPECTED);
  });

  it('PipelineCollector.getMonitoredRepositories splits a comma-separated string config value', async () => {
    const config = createFakeConfig({ MONITORED_REPOSITORIES: RAW });
    const collector = new PipelineCollector(config);

    const result = await collector.getMonitoredRepositories();

    expect(result).toEqual(EXPECTED);
  });

  it('ComplianceService.getMonitoredRepositories splits a comma-separated string config value', async () => {
    const config = createFakeConfig({ MONITORED_REPOSITORIES: RAW });
    const templateEngine = createFakeTemplateEngine();
    const service = new ComplianceService({ config, templateEngine });

    const result = await service.getMonitoredRepositories();

    expect(result).toEqual(EXPECTED);
  });
  // ops #3586: the FOURTH reader. Its ops #2656 fix ends with
  // `Array.isArray(repos) ? repos.filter(Boolean) : []`, which is not an
  // array for a string and so yielded [] -- a health monitor watching NOTHING
  // for a correctly-documented config value. That is the ops #2656 failure
  // arriving through a different door, and it would have left this monitor
  // disagreeing with the three services above about what the estate is.
  it('PipelineHealthMonitor.getConfiguredRepositories splits a comma-separated string config value', async () => {
    const config = createFakeConfig({ MONITORED_REPOSITORIES: RAW });
    const monitor = new PipelineHealthMonitor({ config });

    const result = await monitor.getConfiguredRepositories();

    expect(result).toEqual(EXPECTED);
  });

  it('PipelineHealthMonitor still returns [] for a genuinely empty setting', async () => {
    // NEGATIVE CONTROL. Without it, a normalise step that returned the
    // default list for every falsy input would pass the test above too, and
    // the empty-set warning this monitor exists to emit would never fire.
    const config = createFakeConfig({ MONITORED_REPOSITORIES: ' , ,' });
    const monitor = new PipelineHealthMonitor({ config });

    const result = await monitor.getConfiguredRepositories();

    expect(result).toEqual([]);
  });
});
