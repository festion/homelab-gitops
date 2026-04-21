// api/tests/fakes/templateEngine.js
// Plain-object-backed fake for the TemplateEngine interface used by
// ComplianceService. Tests mutate `state` to control what each method returns.

function createFakeTemplateEngine({ templates = [], applyResult = null } = {}) {
  const state = {
    templates,
    applyResult,
    applyCalls: [],
    complianceResult: null,
  };
  return {
    state,
    listTemplates: jest.fn(async () => state.templates),
    applyTemplate: jest.fn(async (repoPath, templateName, opts) => {
      state.applyCalls.push({ repoPath, templateName, opts });
      return (
        state.applyResult || {
          success: true,
          templateName,
          filesWritten: [],
        }
      );
    }),
    checkTemplateCompliance: jest.fn(async () => {
      return state.complianceResult || { compliant: true, issues: [] };
    }),
  };
}

module.exports = { createFakeTemplateEngine };
