// ops #4355: the WebSocket feed reads live audit data in prod, not the stale
// 2025 fixture that used to ship inside the dashboard build.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveAuditDataPath, PROD_AUDIT_DATA_PATH } = require('../../audit-data-path');
const { EventEmitter } = require('events');
const { spawnSync } = require('child_process');

// chokidar 5 is ESM-only; jest's CJS runtime cannot load it, so the unit
// tests inject a fake and the symlink behaviour is proven against the REAL
// chokidar in a child node process below.
const mockWatch = jest.fn();
jest.mock('chokidar', () => ({ watch: (...a) => mockWatch(...a) }));
const WebSocketManager = require('../../websocket-server');

describe('resolveAuditDataPath', () => {
  test('prod reads audit-history/latest.json', () => {
    expect(resolveAuditDataPath(false, '/opt/gitops')).toBe('/opt/gitops/audit-history/latest.json');
    expect(PROD_AUDIT_DATA_PATH).not.toMatch(/dashboard|GitRepoReport/);
  });

  test('dev keeps the checked-in fixture fallback', () => {
    expect(resolveAuditDataPath(true, '/repo')).toBe('/repo/dashboard/public/GitRepoReport.json');
  });
});

describe('WebSocketManager audit feed', () => {
  let dir, mgr;
  const make = (file) => {
    mgr = Object.create(WebSocketManager.prototype);
    mgr.auditDataPath = file;
    mgr.clients = new Set();
    return mgr;
  };
  const fakeWs = () => ({ readyState: 1, send: jest.fn() });

  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-')); });
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  test('sends data resolved through the latest.json symlink', () => {
    const real = path.join(dir, '2026-10-05T08:02:06Z.json');
    fs.writeFileSync(real, JSON.stringify({ timestamp: '2026-10-05T08:02:06Z', repos: [] }));
    fs.symlinkSync(real, path.join(dir, 'latest.json'));
    const ws = fakeWs();
    make(path.join(dir, 'latest.json')).sendCurrentData(ws);
    const msg = JSON.parse(ws.send.mock.calls[0][0]);
    expect(msg.type).toBe('audit-update');
    expect(msg.data.timestamp).toBe('2026-10-05T08:02:06Z');
  });

  test('missing file yields an error message, not a throw', () => {
    const ws = fakeWs();
    expect(() => make(path.join(dir, 'latest.json')).sendCurrentData(ws)).not.toThrow();
    const msg = JSON.parse(ws.send.mock.calls[0][0]);
    expect(msg.type).toBe('error');
  });

  test('watcher watches the DIRECTORY and only broadcasts for audit reports', () => {
    const watcher = new EventEmitter();
    mockWatch.mockReturnValue(watcher);
    make(path.join(dir, 'latest.json'));
    mgr.debounceDelay = 0;
    mgr.lastBroadcastTime = 0;
    mgr.broadcastUpdate = jest.fn();
    mgr.setupFileWatcher();
    expect(mockWatch.mock.calls[0][0]).toBe(dir);
    watcher.emit('add', path.join(dir, 'notes.txt'));
    expect(mgr.broadcastUpdate).not.toHaveBeenCalled();
    watcher.emit('add', path.join(dir, '2026-10-05T08:02:06Z.json'));
    expect(mgr.broadcastUpdate).toHaveBeenCalledTimes(1);
  });

  test('hidden-file filter looks at the entry name only, never the parent path', () => {
    expect(WebSocketManager.isIgnored('/home/dev/repo/.worktrees/x/audit-history')).toBe(false);
    expect(WebSocketManager.isIgnored('/opt/gitops/audit-history/2026-10-05T08:02:06Z.json')).toBe(false);
    expect(WebSocketManager.isIgnored('/opt/gitops/audit-history/.latest.json.tmp')).toBe(true);
    mockWatch.mockReturnValue(new EventEmitter());
    make(path.join(dir, '.hidden-parent', 'latest.json'));
    mgr.setupFileWatcher();
    const opts = mockWatch.mock.calls[mockWatch.mock.calls.length - 1][1];
    const root = path.dirname(mgr.auditDataPath);
    expect(opts.ignored(root)).toBe(false);                       // the dot-named root itself
    expect(opts.ignored(path.join(root, 'latest.json'))).toBe(false);
    expect(opts.ignored(path.join(root, '.tmp-write'))).toBe(true);
  });

  test('REAL chokidar: re-pointing the latest.json symlink fires an event', () => {
    const script = `
      const fs=require('fs'),path=require('path'),os=require('os');
      const chokidar=require('chokidar');
      const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sym-'));
      const a=path.join(dir,'2026-10-04T08:00:00Z.json'), b=path.join(dir,'2026-10-05T08:00:00Z.json');
      fs.writeFileSync(a,'{}'); fs.writeFileSync(b,'{}');
      const link=path.join(dir,'latest.json'); fs.symlinkSync(a,link);
      const w=chokidar.watch(dir,{ignoreInitial:true,depth:0,awaitWriteFinish:{stabilityThreshold:200,pollInterval:50}});
      const names=[]; w.on('add',f=>names.push(path.basename(f))); w.on('change',f=>names.push(path.basename(f)));
      w.on('ready',()=>{ fs.rmSync(link); fs.symlinkSync(b,link);
        setTimeout(()=>{ console.log(JSON.stringify(names)); w.close().then(()=>process.exit(0)); },2500); });
    `;
    const r = spawnSync(process.execPath, ['-e', script], { cwd: path.join(__dirname, '../..'), encoding: 'utf8', timeout: 20000 });
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout.trim())).toContain('latest.json');
  }, 30000);
});
