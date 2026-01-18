import React, { useEffect, useState } from 'react';

import { useUnifiedStore } from '@/stores/useUnifiedStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This effect will run once to check if the store is hydrated
    const unsubscribe = useUnifiedStore.persist.onHydrate(() => {
      setIsHydrated(false);
    });

    const unsubFinish = useUnifiedStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // If the store is already hydrated, set state to true
    if (useUnifiedStore.persist.hasHydrated()) {
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
