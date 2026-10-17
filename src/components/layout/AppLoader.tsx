import styles from './AppLoader.module.css';

export const AppLoader = () => {
  // No timer needed here like the BotLoader, because App.tsx 
  // automatically unmounts this component as soon as auth finishes!
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
        <div className={styles.initText}></div>
      </div>
    </div>
  );
};