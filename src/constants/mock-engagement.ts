////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
// Social media posts for every unit in src/config/org-structure.ts.
////////////////////////////////////////////////////////////////////////////////

import { divisions, type DivisionId } from '@/config/divisions';
import type { PlatformId } from '@/config/social-platforms';
import type {
  EngagementFilters,
  EngagementMetrics,
  EngagementPost,
  EngagementPostsFilters,
  EngagementPostsResponse,
  EngagementRow,
  EngagementSummary,
  EngagementTotals,
  SlcAction,
  SlcUser,
  SlcUsersFilters,
  SlcUsersResponse
} from '@/features/engagement/api/types';
import { formatShortDate } from '@/features/engagement/lib/format';
import {
  getAllUnits,
  getChildren,
  getDescendantIds,
  getScopePlatforms,
  getUnit,
  getUnitDepth,
  getUnitPlatforms
} from '@/features/engagement/lib/org-tree';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Seeded PRNG: the same unit + platform always yields the same posts, so the
// server prefetch and the client fetch agree and a reload shows the same numbers.
function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ANCHOR_DATE = Date.UTC(2026, 9, 15, 9);
const DAY_MS = 24 * 60 * 60 * 1000;

// Higher levels have bigger audiences
const DEPTH_SCALE = [30, 9, 3, 1];
const PLATFORM_SCALE: Record<PlatformId, number> = {
  instagram: 1,
  tiktok: 1.6,
  facebook: 0.6,
  x: 0.35,
  youtube: 0.5
};

const CAPTIONS = [
  'Patroli dialogis bersama warga untuk menjaga kamtibmas',
  'Pengamanan arus lalu lintas pada jam sibuk',
  'Jumat Curhat: mendengar langsung aspirasi masyarakat',
  'Bakti sosial dan pembagian sembako untuk warga',
  'Sosialisasi bahaya narkoba di sekolah',
  'Imbauan keselamatan berkendara: gunakan helm SNI',
  'SIM keliling hadir di lokasi berikut',
  'Ungkap kasus pencurian kendaraan bermotor',
  'Apel kesiapan pengamanan kegiatan masyarakat',
  'Edukasi penipuan online dan cara melapor',
  'Polisi Sahabat Anak berkunjung ke taman kanak-kanak',
  'Gotong royong membersihkan lingkungan bersama warga',
  'Layanan pengaduan 110 siap 24 jam',
  'Pengamanan ibadah agar berjalan aman dan khidmat',
  'Penanaman pohon dalam rangka penghijauan'
];

// Engagement from the Humas division weighs more than the others
const DIVISION_WEIGHT: Partial<Record<DivisionId, number>> = { humas: 2.5 };

/** A post plus its engagement split per division (internal to the mock). */
type MockPost = EngagementPost & {
  byDivision: Record<DivisionId, EngagementMetrics>;
};

/** Splits `total` by `weights`; the rounding remainder goes to the heaviest weight. */
function splitByWeight(total: number, weights: number[]) {
  const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
  const parts = weights.map((weight) => Math.floor((total * weight) / weightSum));
  const heaviest = weights.indexOf(Math.max(...weights));
  parts[heaviest] += total - parts.reduce((acc, part) => acc + part, 0);
  return parts;
}

function splitByDivision(post: EngagementPost): Record<DivisionId, EngagementMetrics> {
  // Own seed, so adding divisions never changes the post numbers themselves
  const random = mulberry32(hashString(`${post.id}:divisions`));
  const weightsFor = () =>
    divisions.map((division) => (DIVISION_WEIGHT[division.id] ?? 1) * (0.4 + random()));
  const likes = splitByWeight(post.likes, weightsFor());
  const comments = splitByWeight(post.comments, weightsFor());
  const shares = splitByWeight(post.shares, weightsFor());

  return Object.fromEntries(
    divisions.map((division, i) => [
      division.id,
      { likes: likes[i], comments: comments[i], shares: shares[i] }
    ])
  ) as Record<DivisionId, EngagementMetrics>;
}

function generatePosts(unitId: string, unitName: string, platform: PlatformId): MockPost[] {
  const random = mulberry32(hashString(`${unitId}:${platform}`));
  const scale = (DEPTH_SCALE[getUnitDepth(unitId)] ?? 1) * PLATFORM_SCALE[platform];
  const count = 4 + Math.floor(random() * 5);

  return Array.from({ length: count }, (_, i) => {
    const likes = Math.round(800 * scale * (0.4 + random() * 1.2));
    const post: EngagementPost = {
      id: `${unitId}--${platform}--${i + 1}`,
      unitId,
      unitName,
      platform,
      caption: CAPTIONS[Math.floor(random() * CAPTIONS.length)],
      postedAt: new Date(ANCHOR_DATE - Math.floor(random() * 60 * DAY_MS)).toISOString(),
      likes,
      comments: Math.round(likes * (0.03 + random() * 0.07)),
      shares: Math.round(
        likes * (platform === 'tiktok' ? 0.05 + random() * 0.1 : 0.01 + random() * 0.05)
      )
    };
    return { ...post, byDivision: splitByDivision(post) };
  });
}

/** The post's engagement, or only the part that came from one division. */
function metricsOf(post: MockPost, divisionId: DivisionId | null): EngagementMetrics {
  const { likes, comments, shares } = divisionId ? post.byDivision[divisionId] : post;
  return { likes, comments, shares };
}

function sum(posts: MockPost[], divisionId: DivisionId | null): EngagementTotals {
  return posts.reduce(
    (acc, post) => {
      const metrics = metricsOf(post, divisionId);
      return {
        likes: acc.likes + metrics.likes,
        comments: acc.comments + metrics.comments,
        shares: acc.shares + metrics.shares,
        posts: acc.posts + 1
      };
    },
    { likes: 0, comments: 0, shares: 0, posts: 0 }
  );
}

const engagementTotal = (row: EngagementRow) => row.likes + row.comments + row.shares;

function toPublicPost({ byDivision: _, ...post }: MockPost): EngagementPost {
  return post;
}

// ---------------------------------------------------------------------------
// SLC personnel: for every post and division, exactly `likes` people liked,
// `comments` commented and `shares` shared, so the table matches the chart.
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'Andi',
  'Budi',
  'Dedi',
  'Eko',
  'Fajar',
  'Gilang',
  'Hendra',
  'Indra',
  'Joko',
  'Lukman',
  'Muhammad',
  'Nanda',
  'Putra',
  'Rizky',
  'Sandi',
  'Teguh',
  'Wahyu',
  'Yoga',
  'Zainal',
  'Agus',
  'Bayu',
  'Dimas',
  'Rina',
  'Siti',
  'Dewi',
  'Putri',
  'Ayu',
  'Fitri',
  'Maya',
  'Nurul'
];
// Optional middle names keep a few thousand people from sharing the same full name
const MIDDLE_NAMES = [
  'Adi',
  'Arief',
  'Bagus',
  'Cahya',
  'Dwi',
  'Eka',
  'Hadi',
  'Ilham',
  'Kurnia',
  'Nur',
  'Rahmat',
  'Sri',
  'Tri',
  'Yudha',
  'Aditya',
  'Bima',
  'Galih',
  'Reza',
  'Surya',
  'Wira'
];
const LAST_NAMES = [
  'Pratama',
  'Saputra',
  'Wijaya',
  'Santoso',
  'Hidayat',
  'Nugroho',
  'Setiawan',
  'Kurniawan',
  'Gunawan',
  'Siregar',
  'Nasution',
  'Hutapea',
  'Simanjuntak',
  'Harahap',
  'Lubis',
  'Sihombing',
  'Firmansyah',
  'Ramadhan',
  'Hakim',
  'Prasetyo',
  'Wibowo',
  'Susanto',
  'Purnomo',
  'Maulana'
];
// Lowest to highest; lower ranks are more common
const RANKS = [
  'Bripda',
  'Briptu',
  'Brigpol',
  'Bripka',
  'Aipda',
  'Aiptu',
  'Ipda',
  'Iptu',
  'AKP',
  'Kompol'
];
const RANK_WEIGHTS = [22, 18, 15, 12, 9, 7, 6, 5, 4, 2];
const RANK_WEIGHT_SUM = RANK_WEIGHTS.reduce((acc, weight) => acc + weight, 0);
const HOUR_MS = 60 * 60 * 1000;

function pick<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function pickRank(random: () => number) {
  let roll = random() * RANK_WEIGHT_SUM;
  for (let i = 0; i < RANKS.length; i++) {
    roll -= RANK_WEIGHTS[i];
    if (roll < 0) return RANKS[i];
  }
  return RANKS[0];
}

/** Marks exactly `count` of `size` slots, chosen at random (partial Fisher–Yates). */
function pickSlots(size: number, count: number, random: () => number) {
  const order = Array.from({ length: size }, (_, i) => i);
  const marked = Array.from({ length: size }, () => false);
  for (let i = 0; i < Math.min(count, size); i++) {
    const j = i + Math.floor(random() * (size - i));
    [order[i], order[j]] = [order[j], order[i]];
    marked[order[i]] = true;
  }
  return marked;
}

function generateSlcUsers(post: MockPost): SlcUser[] {
  const scopeUnits = getDescendantIds(post.unitId).map((id) => getUnit(id)!);
  const postedAt = Date.parse(post.postedAt);

  return divisions.flatMap((division) => {
    const { likes, comments, shares } = post.byDivision[division.id];
    const size = Math.max(likes, comments, shares);
    const random = mulberry32(hashString(`${post.id}:${division.id}:slc`));
    const liked = pickSlots(size, likes, random);
    const commented = pickSlots(size, comments, random);
    const shared = pickSlots(size, shares, random);

    return Array.from({ length: size }, (_, i) => {
      const first = pick(FIRST_NAMES, random);
      const middle = random() < 0.6 ? pick(MIDDLE_NAMES, random) : null;
      const last = pick(LAST_NAMES, random);
      const unit = pick(scopeUnits, random);
      const birthYear = String((70 + Math.floor(random() * 34)) % 100).padStart(2, '0');
      const month = String(1 + Math.floor(random() * 12)).padStart(2, '0');
      const sequence = String(Math.floor(random() * 10000)).padStart(4, '0');
      return {
        id: `${post.id}:${division.id}:${i}`,
        name: [first, middle, last].filter(Boolean).join(' '),
        nrp: `${birthYear}${month}${sequence}`,
        rank: pickRank(random),
        divisionId: division.id,
        divisionLabel: division.label,
        unitId: unit.id,
        unitName: unit.name,
        account: `@${first}.${last}${Math.floor(random() * 100)}`.toLowerCase(),
        liked: liked[i],
        commented: commented[i],
        shared: shared[i],
        actedAt: new Date(postedAt + Math.floor(random() * 48 * HOUR_MS)).toISOString()
      };
    });
  });
}

// Generating is cheap but not free for big posts; keep the last few around
const slcCache = new Map<string, SlcUser[]>();
const SLC_CACHE_SIZE = 20;

function slcUsersOf(post: MockPost) {
  let users = slcCache.get(post.id);
  if (!users) {
    users = generateSlcUsers(post);
    slcCache.set(post.id, users);
    if (slcCache.size > SLC_CACHE_SIZE) slcCache.delete(slcCache.keys().next().value!);
  }
  return users;
}

const SLC_ACTIONS: SlcAction[] = ['likes', 'comments', 'shares'];

function didAction(user: SlcUser, action: SlcAction) {
  if (action === 'likes') return user.liked;
  return action === 'comments' ? user.commented : user.shared;
}

function parseList(value: string | undefined) {
  return value ? value.split(/[.,]/).filter(Boolean) : [];
}

const slcSortValues: Record<string, (user: SlcUser) => string | number> = {
  name: (user) => user.name,
  nrp: (user) => user.nrp,
  rank: (user) => RANKS.indexOf(user.rank),
  division: (user) => user.divisionLabel,
  satuan: (user) => user.unitName,
  actedAt: (user) => user.actedAt
};
const DEFAULT_SLC_SORT = [{ id: 'actedAt', desc: true }];

function parseSlcSort(sort: string | undefined): { id: string; desc: boolean }[] {
  try {
    const items = sort ? (JSON.parse(sort) as { id: string; desc: boolean }[]) : [];
    const valid = items.filter((item) => item.id in slcSortValues);
    return valid.length ? valid : DEFAULT_SLC_SORT;
  } catch {
    return DEFAULT_SLC_SORT;
  }
}

function compareSlcUsers(sort: { id: string; desc: boolean }[]) {
  return (a: SlcUser, b: SlcUser) => {
    for (const { id, desc } of sort) {
      const x = slcSortValues[id](a);
      const y = slcSortValues[id](b);
      const order = typeof x === 'number' ? x - Number(y) : x.localeCompare(String(y));
      if (order !== 0) return desc ? -order : order;
    }
    return 0;
  };
}

export const fakeEngagement = {
  records: [] as MockPost[],

  initialize() {
    this.records = getAllUnits().flatMap((unit) =>
      getUnitPlatforms(unit.id).flatMap((platform) =>
        generatePosts(unit.id, unit.name, platform.id)
      )
    );
  },

  /** Posts of one unit's own account on one platform, newest first. */
  async getPosts({ unitId, platform }: EngagementPostsFilters): Promise<EngagementPostsResponse> {
    await delay(300);
    const posts = this.records
      .filter((post) => post.unitId === unitId && post.platform === platform)
      .toSorted((a, b) => b.postedAt.localeCompare(a.postedAt))
      .map(toPublicPost);
    return { posts };
  },

  async getSummary({
    unitId,
    platform,
    postId,
    divisionId
  }: EngagementFilters): Promise<EngagementSummary> {
    await delay(500);

    const scopedDivisions = divisionId
      ? divisions.filter((division) => division.id === divisionId)
      : divisions;

    const post =
      (postId &&
        this.records.find(
          (record) =>
            record.id === postId && record.unitId === unitId && record.platform === platform
        )) ||
      null;

    if (post) {
      return {
        totals: { ...metricsOf(post, divisionId), posts: 1 },
        byDivision: scopedDivisions.map((division) => ({
          id: division.id,
          label: division.label,
          ...metricsOf(post, division.id),
          posts: 1
        })),
        byUnit: null,
        byPlatform: null,
        byPost: null,
        post: toPublicPost(post)
      };
    }

    const scopeIds = new Set(getDescendantIds(unitId));
    const scoped = this.records.filter(
      (record) => scopeIds.has(record.unitId) && (!platform || record.platform === platform)
    );

    const children = getChildren(unitId);
    const byUnit = children.length
      ? children.map((child) => {
          const childIds = new Set(getDescendantIds(child.id));
          return {
            id: child.id,
            label: child.name,
            ...sum(
              scoped.filter((record) => childIds.has(record.unitId)),
              divisionId
            )
          };
        })
      : null;

    const byPlatform = platform
      ? null
      : getScopePlatforms(unitId).map((item) => ({
          id: item.id,
          label: item.label,
          ...sum(
            scoped.filter((record) => record.platform === item.id),
            divisionId
          )
        }));

    const byDivision = divisionId
      ? null
      : divisions.map((division) => ({
          id: division.id,
          label: division.label,
          ...sum(scoped, division.id)
        }));

    const byPost =
      unitId && platform
        ? scoped
            .filter((record) => record.unitId === unitId)
            .map((record) => ({
              id: record.id,
              label: `${formatShortDate(record.postedAt)} · ${record.caption}`,
              ...metricsOf(record, divisionId),
              posts: 1
            }))
            .toSorted((a, b) => engagementTotal(b) - engagementTotal(a))
            .slice(0, 10)
        : null;

    return {
      totals: sum(scoped, divisionId),
      byDivision,
      byUnit,
      byPlatform,
      byPost,
      post: null
    };
  },

  async getPost(postId: string): Promise<EngagementPost | null> {
    await delay(200);
    const post = this.records.find((record) => record.id === postId);
    return post ? toPublicPost(post) : null;
  },

  /** People who did SLC on one post, filtered, sorted and paged like a table. */
  async getSlcUsers({
    postId,
    page,
    limit,
    search,
    divisions: divisionIds,
    units,
    actions,
    sort
  }: SlcUsersFilters): Promise<SlcUsersResponse> {
    await delay(400);
    const post = this.records.find((record) => record.id === postId);
    if (!post) {
      return { users: [], total: 0, counts: { likes: 0, comments: 0, shares: 0, people: 0 } };
    }

    const divisionFilter = parseList(divisionIds);
    const unitFilter = parseList(units);
    const actionFilter = SLC_ACTIONS.filter((action) => parseList(actions).includes(action));
    const query = search?.trim().toLowerCase();

    const rows = slcUsersOf(post).filter(
      (user) =>
        (!divisionFilter.length || divisionFilter.includes(user.divisionId)) &&
        (!unitFilter.length || unitFilter.includes(user.unitId)) &&
        (!actionFilter.length || actionFilter.some((action) => didAction(user, action))) &&
        (!query ||
          [user.name, user.nrp, user.account].some((value) => value.toLowerCase().includes(query)))
    );

    const counts = rows.reduce(
      (acc, user) => ({
        likes: acc.likes + Number(user.liked),
        comments: acc.comments + Number(user.commented),
        shares: acc.shares + Number(user.shared),
        people: acc.people + 1
      }),
      { likes: 0, comments: 0, shares: 0, people: 0 }
    );

    const start = (page - 1) * limit;
    return {
      users: rows.toSorted(compareSlcUsers(parseSlcSort(sort))).slice(start, start + limit),
      total: rows.length,
      counts
    };
  }
};

fakeEngagement.initialize();
