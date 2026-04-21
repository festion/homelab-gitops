// api/tests/fakes/templateEngine.js
// Plain-object-backed fake for the TemplateEngine interface used by
// ComplianceService. Tests mutate `state` to control what each method returns.
//
// Method names mirror the real templateEngine (listTemplates, checkCompliance,
// applyTemplate, fileExists) so the fake is a drop-in replacement.

function createFakeTemplateEngine({
  templates = [],
  applyResult = null,
  complianceResult = null,
  fileExistsFn = null,
} = {}) {
  const state = {
    templates,
    applyResult,
    complianceResult,
    applyCalls: [],
    existingFiles: new Set(),
  };
  return {
    state,
    listTemplates: jest.fn(async () => state.templates),
    checkCompliance: jest.fn(async (_repoPath, templateName) => {
      if (state.complianceResult) {
        return typeof state.complianceResult === 'function'
          ? state.complianceResult(templateName)
          : state.complianceResult;
      }
      return {
        compliant: true,
        issues: [],
        template: { id: templateName, version: '1.0.0', getRequiredFiles: () => [] },
      };
    }),
    applyTemplate: jest.fn(async (repoPath, templateName, opts) => {
      state.applyCalls.push({ repoPath, templateName, opts });
      if (state.applyResult) {
        return typeof state.applyResult === 'function'
          ? state.applyResult(templateName, opts)
          : state.applyResult;
      }
      return { success: true, output: `applied ${templateName}`, error: null };
    }),
    fileExists: jest.fn(async (fullPath) => {
      if (fileExistsFn) return fileExistsFn(fullPath);
      return state.existingFiles.has(fullPath);
    }),
  };
}

module.exports = { createFakeTemplateEngine };
