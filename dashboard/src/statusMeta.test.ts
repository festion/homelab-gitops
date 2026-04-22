// Smoke tests for the dashboard's status metadata — pure data, no UI.
// Primary purpose: prove the Vitest harness works end-to-end against real
// dashboard modules; prevents re-regression of #636.

import { describe, it, expect } from 'vitest';
import { STATUS_LABELS, STATUS_COLORS } from './statusMeta';

describe('statusMeta', () => {
  it('exposes the canonical set of status labels', () => {
    expect(STATUS_LABELS).toEqual([
      'Uncommitted',
      'Stale',
      'Missing Files',
      'Mismatched',
      'Extra',
      'Missing',
    ]);
  });

  it('provides a color for every label', () => {
    for (const label of STATUS_LABELS) {
      expect(STATUS_COLORS[label as keyof typeof STATUS_COLORS]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('keeps legacy lowercase aliases as a superset of the canonical labels', () => {
    const legacy = ['dirty', 'clean', 'missing', 'extra', 'mismatched', 'not_git'];
    for (const key of legacy) {
      expect(STATUS_COLORS[key as keyof typeof STATUS_COLORS]).toBeDefined();
    }
  });
});
