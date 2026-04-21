// api/tests/fakes/orchestrator.js
// Fake of PipelineOrchestrator. Shape mirrors the real class: exposes
// orchestratePipeline(config), getOrchestrationStatus(id), cancelOrchestration(id),
// listActiveOrchestrations(). State is mutable so tests can drive scenarios by
// setting fakeOrch.state.rateLimited = true, fakeOrch.state.failingRepos = [...],
// etc.

function createFakeOrchestrator({ wsEmit = null, autoCompleteDelayMs = 50 } = {}) {
  const state = {
    orchestrations: new Map(),
    rateLimited: false,
    failingRepos: [],
    continueOnFailure: true,
  };

  function emit(event, data) {
    if (wsEmit) wsEmit(event, data);
  }

  return {
    state,

    async orchestratePipeline(config) {
      const id = `orch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const repositories = Array.isArray(config.repositories) ? config.repositories : [];

      const orch = {
        id,
        status: state.rateLimited ? 'failed' : 'started',
        startedAt: new Date().toISOString(),
        completedAt: null,
        profile: config.profile || null,
        stages: [{ name: 'discovery' }, { name: 'compliance' }, { name: 'pipeline' }],
        results: null,
        error: state.rateLimited ? 'API rate limit exceeded' : null,
        _config: config,
      };
      state.orchestrations.set(id, orch);

      if (!state.rateLimited) {
        // Simulate async completion — schedule a state flip + WS emits.
        emit('orchestration:progress', {
          orchestrationId: id, stage: 'discovery', percentComplete: 0,
          timestamp: new Date().toISOString(),
        });
        setTimeout(() => {
          const successfulRepos = repositories.filter(r => !state.failingRepos.includes(r));
          const failedRepos = repositories.filter(r => state.failingRepos.includes(r));
          const hasFailures = failedRepos.length > 0;
          const continueOnFailure = config.options?.continueOnFailure ?? state.continueOnFailure;

          orch.status = hasFailures
            ? (continueOnFailure ? 'partial_failure' : 'failed')
            : 'completed';
          orch.completedAt = new Date().toISOString();
          orch.results = {
            repositories,
            successful: successfulRepos.map(r => ({ repository: r, status: 'success' })),
            failed: failedRepos.map(r => ({ repository: r, error: 'simulated failure' })),
          };
          emit('orchestration:progress', {
            orchestrationId: id, stage: 'pipeline', percentComplete: 100,
            timestamp: new Date().toISOString(),
          });
          emit('orchestration:completed', {
            orchestrationId: id, status: orch.status, results: orch.results,
            timestamp: new Date().toISOString(),
          });
        }, autoCompleteDelayMs);
      }

      return orch;
    },

    getOrchestrationStatus(orchestrationId) {
      const orch = state.orchestrations.get(orchestrationId);
      if (!orch) {
        throw new Error(`Orchestration ${orchestrationId} not found`);
      }
      return orch;
    },

    listActiveOrchestrations() {
      return Array.from(state.orchestrations.values()).filter(
        o => o.status === 'started' || o.status === 'running'
      );
    },

    async cancelOrchestration(id) {
      const orch = state.orchestrations.get(id);
      if (!orch) throw new Error(`Orchestration ${id} not found`);
      orch.status = 'cancelled';
      orch.cancelledAt = new Date().toISOString();
      return orch;
    },
  };
}

module.exports = { createFakeOrchestrator };
