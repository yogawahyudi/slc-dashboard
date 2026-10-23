import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createUser, resetUserPassword, unlockUser, updateUser } from './service';
import { userKeys } from './queries';
import type { MutationResult } from './types';
import type { CreateUserValues, ResetPasswordValues, UpdateUserValues } from '../schemas/user';

// Turn `{ ok: false, error }` into a rejected mutation so components can use onError.
// Components should pass their own callbacks to mutate()/mutateAsync() instead of
// overriding onSuccess here, which would skip the cache invalidation.
function unwrap(result: MutationResult) {
  if (!result.ok) throw new Error(result.error);
}

function invalidateUsers() {
  return getQueryClient().invalidateQueries({ queryKey: userKeys.all });
}

export const createUserMutation = mutationOptions({
  mutationFn: async (values: CreateUserValues) => unwrap(await createUser(values)),
  onSuccess: invalidateUsers
});

export const updateUserMutation = mutationOptions({
  mutationFn: async ({ id, values }: { id: string; values: UpdateUserValues }) =>
    unwrap(await updateUser(id, values)),
  onSuccess: invalidateUsers
});

export const resetUserPasswordMutation = mutationOptions({
  mutationFn: async ({ id, values }: { id: string; values: ResetPasswordValues }) =>
    unwrap(await resetUserPassword(id, values)),
  onSuccess: invalidateUsers
});

export const unlockUserMutation = mutationOptions({
  mutationFn: async (id: string) => unwrap(await unlockUser(id)),
  onSuccess: invalidateUsers
});
