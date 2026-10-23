import PageContainer from '@/components/layout/page-container';
import SlcListingPage from '@/features/engagement/components/slc-listing';
import { requireUser } from '@/lib/auth/dal';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Detail SLC'
};

type PageProps = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function SlcDetailPage(props: PageProps) {
  await requireUser();
  const { postId } = await props.params;
  searchParamsCache.parse(await props.searchParams);

  return (
    <PageContainer
      pageTitle='Detail SLC'
      pageDescription='Personel yang melakukan like, komentar, dan share (SLC) pada postingan ini.'
    >
      <SlcListingPage postId={postId} />
    </PageContainer>
  );
}
