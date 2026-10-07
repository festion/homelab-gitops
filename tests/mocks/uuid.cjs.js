// uuid >= 12 is ESM-only and jest runs these suites as CommonJS (ops #4395).
// Unit tests only need unique ids, so back v4 with node's crypto.
const { randomUUID } = require('crypto');
module.exports = { v4: randomUUID };
