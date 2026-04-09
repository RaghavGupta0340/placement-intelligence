// Utility helpers

/**
 * Format a number with commas
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format LPA package
 */
export function formatPackage(lpa) {
  if (lpa >= 100) return `₹${(lpa / 100).toFixed(1)} Cr`;
  return `₹${lpa} LPA`;
}

/**
 * Get status color class
 */
export function getStatusColor(status) {
  const colors = {
    seeking: 'badge-neutral',
    applied: 'badge-info',
    shortlisted: 'badge-primary',
    interview: 'badge-warning',
    interviewing: 'badge-warning',
    offered: 'badge-success',
    placed: 'badge-success',
    rejected: 'badge-danger',
  };
  return colors[status] || 'badge-neutral';
}

/**
 * Get alert type color
 */
export function getAlertColor(type) {
  const colors = {
    warning: { bg: 'var(--warning-alpha)', color: 'var(--warning)', icon: 'var(--warning-alpha)' },
    recommendation: { bg: 'var(--primary-alpha)', color: 'var(--primary-light)', icon: 'var(--primary-alpha)' },
    deadline: { bg: 'var(--danger-alpha)', color: 'var(--danger-light)', icon: 'var(--danger-alpha)' },
    action: { bg: 'var(--success-alpha)', color: 'var(--success-light)', icon: 'var(--success-alpha)' },
    insight: { bg: 'var(--info-alpha)', color: 'var(--info)', icon: 'var(--info-alpha)' },
  };
  return colors[type] || colors.action;
}

/**
 * Get match score color
 */
export function getScoreColor(score) {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--primary-light)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

/**
 * Time ago formatter
 */
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Days until a deadline
 */
export function daysUntil(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
