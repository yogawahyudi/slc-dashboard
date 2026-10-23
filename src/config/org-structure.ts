import type { PlatformId } from './social-platforms';

/**
 * Struktur organisasi untuk halaman Engagement Medsos (/dashboard/engagement).
 *
 * Cara mengubah:
 * - Tambah/ganti/hapus satuan: edit `orgStructure`. Setiap satuan boleh punya `children`
 *   (satuan di bawahnya). Kedalaman bebas; jumlah dropdown di halaman mengikuti tree ini.
 * - `id` harus unik di seluruh struktur (dipakai di URL). Gunakan huruf kecil dan tanda '-'.
 * - Nama level (label dropdown) diambil dari `orgLevels` sesuai kedalaman: elemen pertama
 *   untuk satuan paling atas, dan seterusnya. Level tanpa nama tampil sebagai "Level N".
 * - `platforms` (opsional) membatasi media sosial yang dimiliki satuan itu.
 *   Tanpa `platforms`, satuan dianggap punya semua platform di src/config/social-platforms.ts.
 */
export type OrgUnit = {
  id: string;
  name: string;
  platforms?: PlatformId[];
  children?: OrgUnit[];
};

export const orgLevels: string[] = ['Mabes', 'Polda', 'Polres', 'Polsek'];

const polsekPlatforms: PlatformId[] = ['instagram', 'tiktok', 'facebook'];

export const orgStructure: OrgUnit[] = [
  {
    id: 'mabes-polri',
    name: 'Mabes Polri',
    children: [
      {
        id: 'polda-metro-jaya',
        name: 'Polda Metro Jaya',
        children: [
          {
            id: 'polres-metro-jaksel',
            name: 'Polres Metro Jakarta Selatan',
            children: [
              {
                id: 'polsek-kebayoran-baru',
                name: 'Polsek Kebayoran Baru',
                platforms: polsekPlatforms
              },
              { id: 'polsek-tebet', name: 'Polsek Tebet', platforms: polsekPlatforms }
            ]
          },
          {
            id: 'polres-metro-jakpus',
            name: 'Polres Metro Jakarta Pusat',
            children: [
              { id: 'polsek-gambir', name: 'Polsek Gambir', platforms: polsekPlatforms },
              { id: 'polsek-menteng', name: 'Polsek Menteng', platforms: polsekPlatforms }
            ]
          }
        ]
      },
      {
        id: 'polda-jabar',
        name: 'Polda Jawa Barat',
        children: [
          {
            id: 'polrestabes-bandung',
            name: 'Polrestabes Bandung',
            children: [
              { id: 'polsek-coblong', name: 'Polsek Coblong', platforms: polsekPlatforms },
              { id: 'polsek-sukajadi', name: 'Polsek Sukajadi', platforms: polsekPlatforms }
            ]
          },
          {
            id: 'polres-bogor',
            name: 'Polres Bogor',
            children: [
              { id: 'polsek-cibinong', name: 'Polsek Cibinong', platforms: polsekPlatforms }
            ]
          }
        ]
      },
      {
        id: 'polda-jatim',
        name: 'Polda Jawa Timur',
        children: [
          {
            id: 'polrestabes-surabaya',
            name: 'Polrestabes Surabaya',
            children: [
              { id: 'polsek-tegalsari', name: 'Polsek Tegalsari', platforms: polsekPlatforms },
              { id: 'polsek-genteng', name: 'Polsek Genteng', platforms: polsekPlatforms }
            ]
          },
          {
            id: 'polres-malang',
            name: 'Polres Malang',
            children: [
              { id: 'polsek-kepanjen', name: 'Polsek Kepanjen', platforms: polsekPlatforms }
            ]
          }
        ]
      }
    ]
  }
];
