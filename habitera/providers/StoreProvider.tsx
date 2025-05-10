import React, { useEffect, useState } from 'react';

import { useAppStore } from '../stores/useAppStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This effect will run once to check if the store is hydrated
    const unsubscribe = useAppStore.persist.onHydrate(() => {
      setIsHydrated(false);
    });

    const unsubFinish = useAppStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // If the store is already hydrated, set state to true
    if (useAppStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubscribe();
      unsubFinish();
    };
  }, []);

  if (!isHydrated) {
    // You could show a loading indicator here
    return null;
  }

  return <>{children}</>;
};
