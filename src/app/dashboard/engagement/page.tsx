import PageContainer from '@/components/layout/page-container';
import EngagementViewPage from '@/features/engagement/components/engagement-view-page';
import { requireUser } from '@/lib/auth/dal';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Engagement Medsos'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EngagementPage(props: PageProps) {
  await requireUser();
  searchParamsCache.parse(await props.searchParams);

  return (
    <PageContainer
      pageTitle='Engagement Media Sosial'
      pageDescription='Pantau like, komentar, dan share per satuan dan media sosial.'
    >
      <EngagementViewPage />
    </PageContainer>
  );
}
