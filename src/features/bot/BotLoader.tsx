import { useEffect, useState } from 'react';
import styles from './BotLoader.module.css';

type BotLoaderProps = {
  onComplete: () => void;
};

export const BotLoader = ({ onComplete }: BotLoaderProps) => {
  const [statusMessage, setStatusMessage] = useState('Connecting to the server...');

  useEffect(() => {
    const step1 = setTimeout(() => {
      setStatusMessage('Initializing Deriv Bot...');
    }, 1100);

    const step2 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
    };
  }, [onComplete]);

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner} />
      </div>
      <p className={styles.loadingStatusText}>{statusMessage}</p>
      <span className={styles.loadingSubtext}>Please wait a moment</span>
    </div>
  );
};