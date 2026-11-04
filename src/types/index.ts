export interface PengajuanIzin {
  id: number;
  nomor_surat: string;
  nama: string;
  id_karyawan?: string | null;
  jabatan: string;
  jenis_izin: 
    | 'Izin Sakit'
    | 'Izin tidak masuk kerja'
    | 'Izin tidak masuk kerja dengan menerimah upah'
    | 'Izin tidak masuk kerja dengan potongan upah'
    | 'Izin kejadian diluar kendali ( force majeure )'
    | string;
  kategori_alasan?: string | null;
  alasan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  masuk_kembali_tanggal: string;
  surat_dokter_url?: string | null;
  tanda_tangan_pemohon?: string | null;
  status_persetujuan: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditangguhkan' | 'Ditolak' | string;
  ditangguhkan_mulai?: string | null;
  ditangguhkan_selesai?: string | null;
  alasan_atasan?: string | null;
  nama_atasan?: string | null;
  tanda_tangan_atasan?: string | null;
  paraf_hrd?: string | null;
  nama_hrd?: string | null;
  tanggal_surat: string;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  pending: number;
  disetujui: number;
  ditangguhkan: number;
  ditolak: number;
}
