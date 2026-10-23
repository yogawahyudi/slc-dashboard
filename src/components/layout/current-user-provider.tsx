'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@/lib/auth/dal';
import type { AuthMode } from '@/lib/auth/mode';

type CurrentUserContextValue = { user: CurrentUser; authMode: AuthMode };

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  user,
  authMode = 'database',
  children
}: {
  user: CurrentUser;
  /** Where accounts live: database, AUTH_USERS (env) or nowhere (AUTH_DISABLED, development only) */
  authMode?: AuthMode;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={{ user, authMode }}>{children}</CurrentUserContext.Provider>
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

/** How sign-in works: 'database', 'env' (AUTH_USERS) or 'disabled' (AUTH_DISABLED=true). */
export function useAuthMode() {
  return useCurrentUserContext().authMode;
}
