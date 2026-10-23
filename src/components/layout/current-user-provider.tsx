'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@/lib/auth/dal';

type CurrentUserContextValue = { user: CurrentUser; authDisabled: boolean };

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  user,
  authDisabled = false,
  children
}: {
  user: CurrentUser;
  /** True while AUTH_DISABLED=true (development only) */
  authDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={{ user, authDisabled }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

function useCurrentUserContext() {
  const value = useContext(CurrentUserContext);
  if (!value) throw new Error('useCurrentUser must be used within CurrentUserProvider');
  return value;
}

/** The signed-in user. Only usable below the dashboard layout. */
export function useCurrentUser() {
  return useCurrentUserContext().user;
}

/** Whether sign-in is switched off (AUTH_DISABLED=true in development). */
export function useAuthDisabled() {
  return useCurrentUserContext().authDisabled;
}
