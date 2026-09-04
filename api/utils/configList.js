// Some config keys (e.g. MONITORED_REPOSITORIES) are documented as a
// comma-separated string in config/settings.conf and config/settings.local.conf,
// but their in-code defaults are arrays. config-loader.js returns whatever was
// set verbatim, so a value that came from a config file arrives as a raw
// string while the built-in default arrives as an array. Callers that expect
// a list must normalise both shapes into one, or a configured string gets
// iterated one character at a time (ops #3512).
function normalizeConfigList(value) {
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return value;
}

module.exports = { normalizeConfigList };
