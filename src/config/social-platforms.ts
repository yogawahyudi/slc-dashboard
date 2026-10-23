import type { Icons } from '@/components/icons';

/**
 * Daftar media sosial yang bisa dipilih di halaman Engagement Medsos.
 *
 * Tambah platform baru dengan menambah satu baris di sini. `icon` adalah key dari
 * `Icons` (src/components/icons.tsx). Urutan di sini = urutan di dropdown dan chart.
 */
export const socialPlatforms = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook' },
  { id: 'x', label: 'X', icon: 'brandX' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' }
] as const satisfies readonly { id: string; label: string; icon: keyof typeof Icons }[];

export type SocialPlatform = (typeof socialPlatforms)[number];
export type PlatformId = SocialPlatform['id'];
