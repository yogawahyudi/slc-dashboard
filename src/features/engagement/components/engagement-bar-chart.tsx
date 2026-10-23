'use client';

import { Bar, BarChart, LabelList, XAxis, YAxis, type YAxisTickContentProps } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig
} from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { EngagementMetrics, EngagementRow, SlcAction } from '../api/types';
import { formatCompact, formatNumber } from '../lib/format';

export type EngagementMetric = 'total' | 'likes' | 'comments' | 'shares';

export const metricLabels: Record<EngagementMetric, string> = {
  total: 'Total engagement',
  likes: 'Like',
  comments: 'Komentar',
  shares: 'Share'
};

export function getMetricValue(row: EngagementMetrics, metric: EngagementMetric) {
  return metric === 'total' ? row.likes + row.comments + row.shares : row[metric];
}

export type BarDatum = {
  id: string;
  label: string;
  value: number;
};

export type BarDetail = {
  label: string;
  value: number;
  active?: boolean;
  /** Series swatch, for charts with more than one series */
  color?: string;
};

// Single series: one hue, the axis labels name each bar, so no legend
const chartConfig = {
  value: { label: 'Jumlah', color: 'var(--chart-2)' }
} satisfies ChartConfig;

// Desktop: name on the axis left of the bar. Phone: name above the bar, so the
// bars keep the full width and long names that share a prefix stay readable.
const ROW_HEIGHT = 36;
const ROW_HEIGHT_MOBILE = 52;
const MAX_LABEL_LENGTH = 28;
const MAX_LABEL_LENGTH_MOBILE = 44;

function truncate(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

type LabelLookup = {
  labels: Map<string, string>;
  maxLength: number;
};

/** One-line axis label (Recharts' default tick wraps long names onto two lines). */
function CategoryTick({
  x,
  y,
  payload,
  labels,
  maxLength
}: Partial<YAxisTickContentProps> & LabelLookup) {
  const label = labels.get(String(payload?.value)) ?? '';
  return (
    <text x={x} y={y} dy='0.355em' textAnchor='end' className='fill-muted-foreground'>
      <title>{label}</title>
      {truncate(label, maxLength)}
    </text>
  );
}

/** Name above the bar's start, for the phone layout. */
function BarNameLabel({
  x,
  y,
  value,
  labels,
  maxLength
}: { x?: number | string; y?: number | string; value?: unknown } & LabelLookup) {
  const label = labels.get(String(value)) ?? '';
  return (
    <text x={x} y={Number(y) - 6} textAnchor='start' className='fill-muted-foreground'>
      <title>{label}</title>
      {truncate(label, maxLength)}
    </text>
  );
}

/**
 * Horizontal bars, value at each bar tip.
 * `details` fills the tooltip; `onSelect` makes bars clickable.
 */
export function HorizontalBarChart({
  data,
  valueLabel,
  details,
  onSelect
}: {
  data: BarDatum[];
  valueLabel: string;
  details?: (id: string) => BarDetail[];
  onSelect?: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const maxLength = isMobile ? MAX_LABEL_LENGTH_MOBILE : MAX_LABEL_LENGTH;
  const labelById = new Map(data.map((datum) => [datum.id, datum.label]));
  const longestLabel = Math.max(0, ...data.map((datum) => truncate(datum.label, maxLength).length));
  const labelWidth = isMobile ? 0 : longestLabel * 6.5 + 12;

  return (
    <ChartContainer
      config={chartConfig}
      className='aspect-auto w-full'
      style={{ height: data.length * (isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT) + 8 }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout='vertical'
        margin={{ top: isMobile ? 8 : 4, right: 56, bottom: 4, left: 0 }}
      >
        <XAxis type='number' dataKey='value' hide />
        <YAxis
          type='category'
          dataKey='id'
          hide={isMobile}
          width={labelWidth}
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={<CategoryTick labels={labelById} maxLength={maxLength} />}
        />
        <ChartTooltip content={<BarTooltip valueLabel={valueLabel} details={details} />} />
        <Bar
          dataKey='value'
          fill='var(--color-value)'
          radius={[0, 4, 4, 0]}
          maxBarSize={24}
          className={cn(onSelect && 'cursor-pointer')}
          onClick={onSelect ? (_, index) => onSelect(data[index].id) : undefined}
        >
          {isMobile && (
            <LabelList
              dataKey='id'
              content={<BarNameLabel labels={labelById} maxLength={maxLength} />}
            />
          )}
          <LabelList
            dataKey='value'
            position='right'
            offset={8}
            className='fill-foreground'
            fontSize={12}
            formatter={(value) => formatCompact(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

// Three series side by side: categorical slots 1–3 of the dataviz reference palette,
// validated all-pairs for light (#fff) and dark (#161616) cards. Theme --chart-* tokens
// are not used here because several themes make them (near) identical.
const groupedConfig = {
  likes: { label: 'Like', theme: { light: '#2a78d6', dark: '#3987e5' } },
  comments: { label: 'Komentar', theme: { light: '#eb6834', dark: '#d95926' } },
  shares: { label: 'Share', theme: { light: '#1baf7a', dark: '#199e70' } }
} satisfies ChartConfig;

const GROUPED_SERIES = ['likes', 'comments', 'shares'] as const;
// 3 bars of 12px + two 2px gaps, plus air between groups
const GROUP_HEIGHT = 60;
const LEGEND_HEIGHT = 36;

/**
 * Like, komentar and share side by side for each row, value at each bar tip.
 * `onSelect` makes each bar clickable with its row and series.
 */
export function GroupedBarChart({
  rows,
  onSelect
}: {
  rows: EngagementRow[];
  onSelect?: (rowId: string, series: SlcAction) => void;
}) {
  const isMobile = useIsMobile();
  const maxLength = isMobile ? 14 : MAX_LABEL_LENGTH;
  const labelById = new Map(rows.map((row) => [row.id, row.label]));
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const longestLabel = Math.max(0, ...rows.map((row) => truncate(row.label, maxLength).length));

  return (
    <ChartContainer
      config={groupedConfig}
      className='aspect-auto w-full'
      style={{ height: rows.length * GROUP_HEIGHT + LEGEND_HEIGHT }}
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout='vertical'
        barSize={12}
        barGap={2}
        margin={{ top: 0, right: 56, bottom: 4, left: 0 }}
      >
        <XAxis type='number' hide />
        <YAxis
          type='category'
          dataKey='id'
          width={longestLabel * 6.5 + 12}
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={<CategoryTick labels={labelById} maxLength={maxLength} />}
        />
        {/* itemSorter null keeps the series order (Recharts sorts by name by default) */}
        <ChartLegend
          verticalAlign='top'
          itemSorter={null}
          content={<ChartLegendContent verticalAlign='top' />}
        />
        <ChartTooltip
          content={
            <BarTooltip
              valueLabel='Jumlah'
              details={(id) => {
                const row = rowById.get(id)!;
                return GROUPED_SERIES.map((key) => ({
                  label: groupedConfig[key].label,
                  value: row[key],
                  color: `var(--color-${key})`
                }));
              }}
            />
          }
        />
        {GROUPED_SERIES.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={[0, 4, 4, 0]}
            className={cn(onSelect && 'cursor-pointer')}
            onClick={onSelect ? (_, index) => onSelect(rows[index].id, key) : undefined}
          >
            <LabelList
              dataKey={key}
              position='right'
              offset={6}
              className='fill-foreground'
              fontSize={11}
              formatter={(value) => formatCompact(Number(value))}
            />
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function BarTooltip({
  active,
  payload,
  valueLabel,
  details
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: { id: string; label: string; value?: number } }>;
  valueLabel: string;
  details?: (id: string) => BarDetail[];
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;

  const rows = details?.(datum.id) ?? [
    { label: valueLabel, value: datum.value ?? 0, active: true }
  ];

  return (
    <div className='border-border/50 bg-background grid max-w-72 min-w-44 gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl'>
      <div className='font-medium'>{datum.label}</div>
      <div className='grid gap-1'>
        {rows.map((row) => (
          <div key={row.label} className='flex items-center justify-between gap-4'>
            <span
              className={cn(
                'flex items-center gap-1.5',
                row.active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {row.color && (
                <span
                  className='size-2.5 shrink-0 rounded-[2px]'
                  style={{ backgroundColor: row.color }}
                />
              )}
              {row.label}
            </span>
            <span
              className={cn(
                'font-mono tabular-nums',
                row.active ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {formatNumber(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
