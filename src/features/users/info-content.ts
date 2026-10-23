import type { InfobarContent } from '@/components/ui/infobar';

export const usersInfoContent: InfobarContent = {
  title: 'Users — Manajemen Akun',
  sections: [
    {
      title: 'Siapa yang bisa mengakses',
      description:
        'Halaman ini hanya untuk role Admin. Akun hanya dibuat oleh admin; tidak ada pendaftaran mandiri.',
      links: []
    },
    {
      title: 'Role',
      description:
        'Admin: kelola akun dan semua menu. Operator: input dan ubah data. Viewer: hanya melihat. Perubahan role berlaku pada request berikutnya pengguna tersebut.',
      links: []
    },
    {
      title: 'Password & keamanan',
      description:
        'Akun baru dan akun yang password-nya direset wajib mengganti password saat login. Reset password dan menonaktifkan akun langsung mengeluarkan pengguna dari semua perangkat. Login dikunci 15 menit setelah 5 kali salah password; reset password juga membuka kunci.',
      links: []
    },
    {
      title: 'Nonaktifkan, bukan hapus',
      description:
        'Akun tidak dihapus agar jejaknya tetap ada. Nonaktifkan akun untuk mencabut akses; aktifkan lagi kapan saja. Anda tidak dapat menonaktifkan atau mengubah role akun sendiri.',
      links: []
    }
  ]
};
