import styles from "./CalendarTimeViews.module.css";

export default function CalendarTimeHeader({ date }: { date: Date }) {
  return (
    <span className={styles.dateHeading}>
      <span className={styles.weekday}>
        {date.toLocaleDateString("fr-FR", { weekday: "short" })}
      </span>
      <span className={styles.dayNumber}>{date.getDate()}</span>
    </span>
  );
}
