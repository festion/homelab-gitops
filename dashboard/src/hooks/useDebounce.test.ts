// Smoke tests for useDebounce — exercises React hooks + fake timers to
// prove the full Vitest/testing-library integration works end-to-end.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value synchronously', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces updates to the provided value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'one' } }
    );

    expect(result.current).toBe('one');

    rerender({ value: 'two' });
    expect(result.current).toBe('one');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('one');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('two');
  });

  it('collapses rapid updates into a single final value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'd' });
    // After 200ms from the last update, final value resolves.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('d');
  });
});
