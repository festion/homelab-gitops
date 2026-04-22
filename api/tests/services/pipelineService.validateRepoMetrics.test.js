// Vikunja #682: validate canonical per-repo metric shape in
// pipelineService.getPipelineMetrics. Drift between test fakes and real
// GitHub responses should be catchable via a schema check.

const PipelineService = require('../../services/pipeline/pipelineService');

describe('PipelineService.validateRepoMetrics', () => {
  const canonical = {
    total: 10,
    successful: 9,
    failed: 1,
    cancelled: 0,
    successRate: 90,
    failureRate: 10,
    averageDuration: 120,
    medianDuration: 115,
  };

  it('returns valid=true with no issues for a canonical RepoMetrics object', () => {
    const result = PipelineService.validateRepoMetrics(canonical);
    expect(result).toEqual({ valid: true, issues: [] });
  });

  it('flags missing required fields (e.g., cancelled, failureRate, medianDuration)', () => {
    const partial = { total: 10, successful: 9, failed: 1, successRate: 90, averageDuration: 120 };
    const result = PipelineService.validateRepoMetrics(partial);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('cancelled'),
        expect.stringContaining('failureRate'),
        expect.stringContaining('medianDuration'),
      ])
    );
  });

  it('flags non-numeric field types', () => {
    const bad = { ...canonical, total: '10' };
    const result = PipelineService.validateRepoMetrics(bad);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('total') && i.includes('number'))).toBe(true);
  });

  it('rejects null and non-object inputs', () => {
    expect(PipelineService.validateRepoMetrics(null).valid).toBe(false);
    expect(PipelineService.validateRepoMetrics(undefined).valid).toBe(false);
    expect(PipelineService.validateRepoMetrics('metrics').valid).toBe(false);
    expect(PipelineService.validateRepoMetrics(42).valid).toBe(false);
  });

  it('treats calculateMetrics output as canonical (round-trip check)', () => {
    const svc = new PipelineService({ config: { get: () => [] } });
    const runs = [
      { conclusion: 'success', created_at: '2025-01-01T10:00:00Z', updated_at: '2025-01-01T10:05:00Z' },
      { conclusion: 'failure', created_at: '2025-01-01T11:00:00Z', updated_at: '2025-01-01T11:03:00Z' },
    ];
    const result = PipelineService.validateRepoMetrics(svc.calculateMetrics(runs));
    expect(result).toEqual({ valid: true, issues: [] });
  });
});

describe('PipelineService.getPipelineMetrics (drift detection)', () => {
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  const mockRuns = [
    { conclusion: 'success', created_at: '2025-01-01T10:00:00Z', updated_at: '2025-01-01T10:05:00Z' },
    { conclusion: 'failure', created_at: '2025-01-01T11:00:00Z', updated_at: '2025-01-01T11:03:00Z' },
  ];

  const makeService = () => {
    const githubMCP = {
      getWorkflowRuns: jest.fn().mockResolvedValue(mockRuns),
    };
    return new PipelineService({
      config: { get: () => ['org/repo-a'] },
      githubMCP,
    });
  };

  it('emits no drift warning when calculateMetrics returns canonical shape', async () => {
    const svc = makeService();
    await svc.getPipelineMetrics();
    const driftWarnings = warnSpy.mock.calls.filter((c) =>
      typeof c[0] === 'string' && c[0].includes('RepoMetrics drift')
    );
    expect(driftWarnings).toHaveLength(0);
  });

  it('emits a drift warning naming the repo and missing fields when calculateMetrics is stubbed to return partial shape', async () => {
    const svc = makeService();
    jest.spyOn(svc, 'calculateMetrics').mockReturnValue({
      total: 2,
      successful: 1,
      averageDuration: 240,
    });
    await svc.getPipelineMetrics();
    const driftWarnings = warnSpy.mock.calls.filter((c) =>
      typeof c[0] === 'string' && c[0].includes('RepoMetrics drift')
    );
    expect(driftWarnings.length).toBeGreaterThan(0);
    const msg = driftWarnings[0][0];
    expect(msg).toContain('org/repo-a');
    expect(msg).toContain('cancelled');
  });
});
