import { useEffect } from 'react';
import { AppLoader } from '../../components/layout/AppLoader';

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

  return <AppLoader label="Loading simulated bot account" />;
};
