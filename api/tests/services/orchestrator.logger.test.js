// ops #2653: every module in services/orchestrator/ must be able to construct.
//
// All six destructured `createLogger` from `config/logging`, which exports
// `getComponentLogger` and no `createLogger` at all. Destructuring a missing
// export is silent -- it yields `undefined` -- so `require` succeeded, the app
// booted green, and the TypeError waited until a constructor ran, i.e. until an
// orchestration endpoint was actually used. The subsystem is mounted:
// createApp.js -> /api/v2 -> phase2-endpoints.js -> services/orchestrator.
//
// Nothing observed it for over a year because the only suites that exercise
// these modules (test/orchestrator.test.js, test/coordination.test.js,
// test/monitoring.test.js) are three of the eleven files that have never run --
// api/jest.config.js declares `projects[]`, which shadows the top-level
// testMatch that claims to collect `test/`. See ops #2631.
//
// This test lives under tests/ precisely so that it DOES run.
//
// It asserts on construction rather than on the import site. A future refactor
// may legitimately move the logger factory or add `createLogger` to
// config/logging; what must never come back is a module in this directory that
// throws when instantiated.

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const ORCH_DIR = path.join(__dirname, '../../services/orchestrator');

const modules = fs
  .readdirSync(ORCH_DIR)
  .filter((f) => f.endsWith('.js'))
  .sort();

// Some constructors wire event listeners onto what they are handed. An
// EventEmitter satisfies that without pulling in the real orchestrator.
const stubArg = () => {
  const e = new EventEmitter();
  e.github = {};
  e.config = {};
  return e;
};

const firstConstructor = (m) => {
  if (typeof m === 'function') return m;
  if (m && typeof m.default === 'function') return m.default;
  return m && Object.values(m).find((v) => typeof v === 'function');
};

describe('services/orchestrator modules construct (#2653)', () => {
  // If the directory moves or empties, every it.each below silently vanishes
  // and the suite passes by testing nothing -- the reassuring direction.
  it('finds the orchestrator modules', () => {
    expect(modules.length).toBeGreaterThanOrEqual(6);
  });

  it.each(modules)('%s requires without throwing', (file) => {
    expect(() => require(path.join(ORCH_DIR, file))).not.toThrow();
  });

  // The actual regression. A missing logger factory surfaces here and nowhere
  // earlier, because destructuring an absent export is silent.
  it.each(modules)('%s constructs without a missing-factory TypeError', (file) => {
    const Ctor = firstConstructor(require(path.join(ORCH_DIR, file)));
    if (!Ctor) return; // module exports no constructor; nothing to instantiate

    let err = null;
    try {
      new Ctor(stubArg());
    } catch (e) {
      err = e;
    }

    // Deliberately narrow: other constructor-argument complaints are not this
    // bug, and asserting "never throws at all" would make the test brittle
    // against unrelated required-arg changes.
    if (err) {
      expect(err.message).not.toMatch(/is not a function/);
      expect(err.message).not.toMatch(/is not a constructor/);
    }
  });

  it('the logger factory the orchestrator imports is callable', () => {
    const { createLogger } = require('../../utils/logger');
    expect(typeof createLogger).toBe('function');
    expect(createLogger('ops-2653-probe')).toBeDefined();
  });
});
