import PageContainer from '@/components/layout/page-container';
import UserListingPage from '@/features/users/components/user-listing';
import { requireRole } from '@/lib/auth/dal';
import { authMode } from '@/lib/auth/mode';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import { usersInfoContent } from '@/features/users/info-content';
import { UserFormSheetTrigger } from '@/features/users/components/user-form-sheet';

export const metadata = {
  title: 'Dashboard: Users'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function UsersPage(props: PageProps) {
  await requireRole('admin');

  // Account management needs the database, which isn't used while sign-in is off or
  // accounts come from AUTH_USERS
  if (authMode !== 'database') {
    return (
      <PageContainer
        access={false}
        accessFallback={
          <div className='max-w-lg space-y-2 text-center'>
            <p className='text-lg font-medium'>Manajemen akun membutuhkan database</p>
            {authMode === 'env' ? (
              <p className='text-muted-foreground text-sm'>
                Akun saat ini diatur lewat <code>AUTH_USERS</code> di environment. Untuk menambah,
                mengubah, atau menghapus akun, edit variabel itu lalu restart/deploy ulang. Untuk
                mengelola akun dari dashboard, isi <code>DATABASE_URL</code>, jalankan{' '}
                <code>npm run db:migrate</code> dan <code>npm run db:seed-admin</code>, lalu hapus{' '}
                <code>AUTH_USERS</code>.
              </p>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Login sedang dinonaktifkan (<code>AUTH_DISABLED=true</code>). Untuk mengelola akun,
                isi <code>DATABASE_URL</code> di <code>.env.local</code>, jalankan{' '}
                <code>npm run db:migrate</code> dan <code>npm run db:seed-admin</code>, lalu hapus{' '}
                <code>AUTH_DISABLED</code>.
              </p>
            )}
          </div>
        }
      >
        {null}
      </PageContainer>
    );
  }

  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Users'
      pageDescription='Kelola akun, role, dan status pengguna.'
      infoContent={usersInfoContent}
      pageHeaderAction={<UserFormSheetTrigger />}
    >
      <UserListingPage />
    </PageContainer>
  );
}
