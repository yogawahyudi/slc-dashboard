/**
 * Daftar divisi untuk filter "Divisi" di halaman Engagement Medsos.
 *
 * Satu daftar ini dipakai oleh semua satuan. Tambah/ubah/hapus baris sesuai kebutuhan.
 * `id` harus unik (dipakai di URL); `label` adalah nama yang tampil.
 * Urutan di sini = urutan di dropdown dan chart per divisi.
 */
export const divisions = [
  { id: 'humas', label: 'Humas' },
  { id: 'reskrim', label: 'Reskrim' },
  { id: 'lantas', label: 'Lantas' },
  { id: 'intelkam', label: 'Intelkam' },
  { id: 'samapta', label: 'Samapta' },
  { id: 'narkoba', label: 'Narkoba' },
  { id: 'propam', label: 'Propam' }
] as const satisfies readonly { id: string; label: string }[];

export type Division = (typeof divisions)[number];
export type DivisionId = Division['id'];
