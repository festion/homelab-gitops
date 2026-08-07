// ops #2628: the MCP compliance check must never pressure a repository into
// TRACKING a `.mcp.json`.
//
// A project-scope `.mcp.json` carries an inline `env` block and docker
// `-e NAME=value` args -- credentials -- and it is the file a developer fills
// in with real ones. The old check reported a missing `.mcp.json` as a HIGH
// severity issue with the recommendation "Add .mcp.json configuration file",
// which is precisely the shape that put a live Home Assistant long-lived token
// into a PUBLIC repo's git history (ops #2625).
//
// The requirement is now satisfied by a committed `.mcp.json.example` (or by a
// local, gitignored `.mcp.json`), and the recommendation must never name a bare
// `.mcp.json` as the thing to add.

const os = require('os');
const path = require('path');
const fs = require('fs').promises;

const TemplateEngine = require('../../services/compliance/templateEngine');

const TEMPLATE = { id: 'standard-devops', requirements: { git: false, mcp: true } };

describe('TemplateEngine MCP config compliance (#2628)', () => {
  let engine;
  let repoDir;

  beforeEach(async () => {
    engine = new TemplateEngine();
    repoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcpcompliance-'));
  });

  afterEach(async () => {
    await fs.rm(repoDir, { recursive: true, force: true });
  });

  const mcpIssues = async (template = TEMPLATE) => {
    const issues = await engine.checkCustomCompliance(repoDir, template);
    return issues.filter((i) => String(i.file).includes('.mcp.json'));
  };

  it('is satisfied by a committed .mcp.json.example', async () => {
    await fs.writeFile(path.join(repoDir, '.mcp.json.example'), '{"mcpServers":{}}');
    expect(await mcpIssues()).toHaveLength(0);
  });

  it('is satisfied by a local (gitignored) .mcp.json', async () => {
    await fs.writeFile(path.join(repoDir, '.mcp.json'), '{"mcpServers":{}}');
    expect(await mcpIssues()).toHaveLength(0);
  });

  it('raises exactly one issue when neither file is present', async () => {
    expect(await mcpIssues()).toHaveLength(1);
  });

  // The security-relevant assertion: WHAT the check asks for, not merely THAT
  // it fired. A check that fires but still says "add .mcp.json" is the bug.
  it('never asks the repository to add a tracked .mcp.json', async () => {
    const [issue] = await mcpIssues();

    expect(issue.file).toBe('.mcp.json.example');
    expect(issue.file).not.toBe('.mcp.json');

    // The recommendation must point at the example, and must not read as an
    // instruction to create a bare .mcp.json.
    expect(issue.recommendation).toMatch(/\.mcp\.json\.example/);
    expect(issue.recommendation).not.toMatch(/add\s+(a\s+)?\.mcp\.json(?!\.example)/i);
  });

  it('raises nothing when the template does not require MCP', async () => {
    const noMcp = { id: 'standard-devops', requirements: { git: false, mcp: false } };
    expect(await mcpIssues(noMcp)).toHaveLength(0);
  });
});
