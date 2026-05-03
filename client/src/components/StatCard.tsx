/**
 * StatCard Component
 * Displays a statistic with icon, label, and value
 */

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'accent' | 'green' | 'orange' | 'purple';
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  variant = 'accent',
}: StatCardProps) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-sub">{subtitle}</div>}
    </div>
  );
}
