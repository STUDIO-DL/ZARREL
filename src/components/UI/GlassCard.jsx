import styles from './GlassCard.module.css';

export default function GlassCard({ children, className = '', variant = 'dark' }) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${className}`}>
      {children}
    </div>
  );
}
