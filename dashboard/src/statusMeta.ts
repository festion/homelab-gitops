export const STATUS_LABELS = [
  'Uncommitted',
  'Stale',
  'Missing Files',
  'Mismatched',
  'Extra',
  'Missing',
];
export const STATUS_COLORS = {
  Uncommitted: '#ef4444', // red-500
  Stale: '#f59e0b', // amber-500
  'Missing Files': '#6366f1', // indigo-500
  Mismatched: '#8b5cf6', // violet-500
  Extra: '#06b6d4', // cyan-500
  Missing: '#dc2626', // red-600
  // Legacy status mappings
  dirty: '#ef4444', // red-500
  clean: '#10b981', // emerald-500
  missing: '#dc2626', // red-600
  extra: '#06b6d4', // cyan-500
  mismatched: '#8b5cf6', // violet-500
  not_git: '#6b7280', // gray-500
};
