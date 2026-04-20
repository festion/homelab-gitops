// api/tests/fakes/githubMCP.js
// Fake of the githubMCP collaborator used by pipelineService + complianceService.
// state.workflowRuns / state.repos are mutable — tests set them before exercising routes.

function createFakeGithubMCP({ workflowRuns = [], repos = [] } = {}) {
  const state = { workflowRuns, repos };
  return {
    state,
    getWorkflowRuns: jest.fn(async (_owner, _repo, _opts) => state.workflowRuns),
    listRepos: jest.fn(async () => state.repos),
  };
}

module.exports = { createFakeGithubMCP };
