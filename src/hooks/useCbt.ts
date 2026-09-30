import { useState, useEffect } from 'react';
import { cbtStore, CbtState } from '../store/cbtStore';

export function useCbt(): {
  state: CbtState;
  store: typeof cbtStore;
} {
  const [state, setState] = useState<CbtState>(() => cbtStore.getState());

  useEffect(() => {
    const unsubscribe = cbtStore.subscribe(() => {
      setState({ ...cbtStore.getState() });
    });
    return unsubscribe;
  }, []);

  return { state, store: cbtStore };
}
