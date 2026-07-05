import styles from './SectionHeading.module.css';

export default function SectionHeading({
  label,
  title,
  description,
  align = 'left',
  dark = false,
  className = '',
}) {
  return (
    <header className={`${styles.heading} ${styles[align]} ${dark ? styles.dark : ''} ${className}`}>
      {label && <span className={styles.label}>{label}</span>}
      {title && <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
