// api/tests/fakes/githubMCP.js
// Fake of the githubMCP collaborator used by pipelineService + complianceService.
// state.workflowRuns / state.repos are mutable — tests set them before exercising routes.

function createFakeGithubMCP({ workflowRuns = [], repos = [], workflows = null } = {}) {
  const state = {
    workflowRuns,
    repos,
    workflows: workflows || [
      { id: 9001, name: 'CI', path: '.github/workflows/ci.yml', state: 'active' },
    ],
    triggeredWorkflows: [],  // record of triggerWorkflow calls for test assertions
    nextRunId: 10000,
  };
  return {
    state,
    getWorkflowRuns: jest.fn(async (_owner, _repo, _opts) => state.workflowRuns),
    getWorkflowRun: jest.fn(async (_owner, _repo, runId) =>
      state.workflowRuns.find(r => String(r.id) === String(runId)) || null
    ),
    getWorkflowJobs: jest.fn(async (_owner, _repo, _runId) => ({ jobs: [], total_count: 0 })),
    listWorkflows: jest.fn(async (_owner, _repo) => state.workflows),
    triggerWorkflow: jest.fn(async (owner, repo, workflowId, data) => {
      const runId = state.nextRunId++;
      const run = {
        id: runId,
        name: state.workflows.find(w => String(w.id) === String(workflowId))?.name || 'CI',
        status: 'completed',
        conclusion: 'success',
        head_branch: data?.ref || 'main',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.workflowRuns.push(run);
      state.triggeredWorkflows.push({ owner, repo, workflowId, data, runId });
      return { id: runId, status: 'queued' };
    }),
    listRepos: jest.fn(async () => state.repos),
  };
}

module.exports = { createFakeGithubMCP };
