import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Fixed bar widths (%) so server and client render the same skeleton
const BAR_WIDTHS = [90, 72, 58, 45, 30];

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-4 w-56' />
      </CardHeader>
      <CardContent className='grid gap-3'>
        {BAR_WIDTHS.map((width, i) => (
          <div key={i} className='flex items-center gap-3'>
            <Skeleton className='h-4 w-28 shrink-0' />
            <Skeleton className='h-5 rounded-sm' style={{ width: `${width}%` }} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EngagementChartsSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-32' />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

export function EngagementPageSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-4 w-64' />
        </CardHeader>
        <CardContent className='flex flex-wrap gap-3'>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className='grid min-w-48 flex-1 gap-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-8 w-full' />
            </div>
          ))}
        </CardContent>
      </Card>
      <EngagementChartsSkeleton />
    </div>
  );
}
