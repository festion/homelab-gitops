// api/tests/fakes/config.js
// Plain-object-backed fake for the ConfigLoader interface.
// Tests mutate `state.values` to change what config.get(key) returns.

function createFakeConfig(initial = {}) {
  const state = { values: { ...initial } };
  return {
    state,
    get: jest.fn((key, fallback) => {
      return Object.prototype.hasOwnProperty.call(state.values, key)
        ? state.values[key]
        : fallback;
    }),
  };
}

module.exports = { createFakeConfig };
