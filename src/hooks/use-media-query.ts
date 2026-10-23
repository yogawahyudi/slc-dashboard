import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 768px)';

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

export function useMediaQuery() {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );

  return { isOpen };
}
