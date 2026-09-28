import { useEffect } from 'react';
import styles from './BotLoader.module.css';

type BotLoaderProps = {
  onComplete: () => void;
};

export const BotLoader = ({ onComplete }: BotLoaderProps) => {
  useEffect(() => {
    // We only need one timer now since the text remains static
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.initLoaderContainer}>
        {/* The 5 staggered wave bars */}
        <div className={styles.initWave}>
          <div className={styles.initBar} style={{ animationDelay: '0s' }}></div>
          <div className={styles.initBar} style={{ animationDelay: '0.1s' }}></div>
          <div className={styles.initBar} style={{ animationDelay: '0.2s' }}></div>
          <div className={styles.initBar} style={{ animationDelay: '0.3s' }}></div>
          <div className={styles.initBar} style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className={styles.initText}>Initializing Deriv Bot account...</div>
      </div>
    </div>
  );
};