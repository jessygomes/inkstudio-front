import styles from "./NotificationBadge.module.css";

interface NotificationBadgeProps {
  count: number;
  label?: string;
  className?: string;
  showZero?: boolean;
}

export default function NotificationBadge({ count, label = "nouveautés non consultées", className = "", showZero = false }: NotificationBadgeProps) {
  if (count <= 0 && !showZero) return null;

  return (
    <span
      aria-label={`${count} ${label}`}
      title={`${count} ${label}`}
      className={`${styles.badge} ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
