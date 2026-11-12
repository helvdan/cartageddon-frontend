import { useEffect, useState } from 'react';
import { subscribeToStorageHealth } from './storageHealth';

export function useStorageHealth(context, endpoint, name, onStorageDeselect) {
  const [health, setHealth] = useState('empty');

  useEffect(() => {
    if (!context) return;
    return subscribeToStorageHealth(`ws://127.0.0.1:8000/infra/${endpoint}/ws/health`, (state) => {
      setHealth(state);
      if (state === 'disconnected') onStorageDeselect(name);
    });
  }, [context, endpoint, name, onStorageDeselect]);

  return health;
}
