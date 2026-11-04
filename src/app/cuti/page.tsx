'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SignaturePad from '@/components/SignaturePad';
import {
  CalendarDays,
  User,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileDown,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  X,
  Printer,
  ShieldCheck,
  UserCheck,
  Palmtree,
  Baby,
  FileText
} from 'lucide-react';
import { DAFTAR_ATASAN } from '@/constants/atasan';

export default function PengajuanCutiPage() {
  const [formData, setFormData] = useState({
    nama: '',
    id_karyawan: '',
    jabatan: '',
    jenis_cuti: 'Cuti Tahunan' as 'Cuti Tahunan' | 'Cuti Melahirkan',
    alasan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    masuk_kembali_tanggal: '',
    hari_tanggal: '',
    hak_cuti: 12,
    cuti_sudah_diambil: 0,
    cuti_belum_diambil: 12,
    cuti_akan_diambil: 1,
    sisa_cuti: 11,
    penerima_amanah_nama: '',
    penerima_amanah_jabatan: '',
    nama_atasan: '',
    jabatan_atasan: '',
    tanda_tangan_pemohon: '',
    tanggal_surat: ''
  });

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Helper to format date range in Indonesian
  const formatDateRangeIndo = (startStr: string, endStr: string) => {
    if (!startStr) return '';
    try {
      const s = new Date(startStr);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const sDay = s.getDate();
      const sMonth = months[s.getMonth()];
      const sYear = s.getFullYear();

      if (!endStr || startStr === endStr) {
        return `${sDay} ${sMonth} ${sYear}`;
      }

      const e = new Date(endStr);
      const eDay = e.getDate();
      const eMonth = months[e.getMonth()];
      const eYear = e.getFullYear();

      if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${sDay} s/d ${eDay} ${sMonth} ${sYear}`;
      }
      return `${sDay} ${sMonth} ${sYear} s/d ${eDay} ${eMonth} ${eYear}`;
    } catch {
      return startStr;
    }
  };

  // Calculate day difference
  const calculateDays = (startStr: string, endStr: string) => {
    if (!startStr) return 1;
    if (!endStr || startStr === endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  // Initialize dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const text = formatDateRangeIndo(today, today);
    setFormData(prev => ({
      ...prev,
      tanggal_surat: today,
      tanggal_mulai: today,
      tanggal_selesai: today,
      hari_tanggal: text,
      cuti_akan_diambil: 1,
      cuti_belum_diambil: 12,
      sisa_cuti: 11
    }));
  }, []);

  const handleStartDateChange = (val: string) => {
    setFormData(prev => {
      const endVal = prev.tanggal_selesai && prev.tanggal_selesai >= val ? prev.tanggal_selesai : val;
      const daysCount = calculateDays(val, endVal);
      const rangeText = formatDateRangeIndo(val, endVal);
      
      // Auto calculate return date (day after end date)
      const nextDay = new Date(endVal);
      nextDay.setDate(nextDay.getDate() + 1);
      const returnDateStr = nextDay.toISOString().split('T')[0];

      const belum = prev.cuti_belum_diambil;
      const sisa = Math.max(0, belum - daysCount);

      return {
        ...prev,
        tanggal_mulai: val,
        tanggal_selesai: endVal,
        masuk_kembali_tanggal: returnDateStr,
        hari_tanggal: rangeText,
        cuti_akan_diambil: daysCount,
        sisa_cuti: sisa
      };
    });
  };

  const handleEndDateChange = (val: string) => {
    setFormData(prev => {
      const startVal = prev.tanggal_mulai || val;
      const daysCount = calculateDays(startVal, val);
      const rangeText = formatDateRangeIndo(startVal, val);

      // Auto calculate return date
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      const returnDateStr = nextDay.toISOString().split('T')[0];

      const belum = prev.cuti_belum_diambil;
      const sisa = Math.max(0, belum - daysCount);

      return {
        ...prev,
        tanggal_selesai: val,
        masuk_kembali_tanggal: returnDateStr,
        hari_tanggal: rangeText,
        cuti_akan_diambil: daysCount,
        sisa_cuti: sisa
      };
    });
  };

  const handleAtasanChange = (selectedNama: string) => {
    const found = DAFTAR_ATASAN.find(a => a.nama === selectedNama);
    setFormData(prev => ({
      ...prev,
      nama_atasan: selectedNama,
      jabatan_atasan: found ? found.jabatan : ''
    }));
  };

  const handleResetForm = () => {
    if (window.confirm('Bersihkan semua isian formulir pengajuan cuti?')) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        nama: '',
        id_karyawan: '',
        jabatan: '',
        jenis_cuti: 'Cuti Tahunan',
        alasan: '',
        tanggal_mulai: today,
        tanggal_selesai: today,
        masuk_kembali_tanggal: '',
        hari_tanggal: formatDateRangeIndo(today, today),
        hak_cuti: 12,
        cuti_sudah_diambil: 0,
        cuti_belum_diambil: 12,
        cuti_akan_diambil: 1,
        sisa_cuti: 11,
        penerima_amanah_nama: '',
        penerima_amanah_jabatan: '',
        nama_atasan: '',
        jabatan_atasan: '',
        tanda_tangan_pemohon: '',
        tanggal_surat: today
      });
      setError(null);
      setSuccessMessage(null);
    }
  };

  // Preview PDF Modal
  const handlePreviewPdf = async () => {
    setError(null);
    if (!formData.id_karyawan.trim()) {
      setError('Harap masukkan ID Karyawan sebelum melihat preview.');
      return;
    }
    setPreviewLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/pengajuan-cuti/preview-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Gagal menghasilkan preview PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memuat preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Submit and Generate PDF Download
  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.nama.trim()) {
      setError('Harap masukkan Nama Lengkap Pemohon.');
      return;
    }
    if (!formData.id_karyawan.trim()) {
      setError('Harap masukkan ID Karyawan.');
      return;
    }
    if (!formData.jabatan.trim()) {
      setError('Harap masukkan Jabatan Pemohon.');
      return;
    }
    if (!formData.alasan.trim()) {
      setError('Harap masukkan Alasan Cuti.');
      return;
    }
    if (!formData.tanggal_mulai || !formData.tanggal_selesai) {
      setError('Harap lengkapi Tanggal Mulai dan Tanggal Selesai Cuti.');
      return;
    }
    if (!formData.masuk_kembali_tanggal) {
      setError('Harap tentukan Tanggal Masuk Kembali.');
      return;
    }
    if (!formData.penerima_amanah_nama.trim()) {
      setError('Harap isi Nama Rekan Kerja Penerima Amanah (Halaman 2 Lampiran).');
      return;
    }

    setLoading(true);

    try {
      // 1. Simpan ke database
      const saveRes = await fetch('http://localhost:5001/api/pengajuan-cuti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!saveRes.ok) {
        console.warn('Gagal menyimpan ke database, tetap melanjutkan generate PDF');
      }

      // 2. Request file PDF untuk di-download
      const pdfRes = await fetch('http://localhost:5001/api/pengajuan-cuti/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!pdfRes.ok) {
        throw new Error('Gagal membuat file PDF cuti.');
      }

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = formData.nama.replace(/\s+/g, '_');
      a.download = `Formulir_Pengajuan_Cuti_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage('Pengajuan Cuti berhasil dibuat dan file PDF telah diunduh!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200/60 text-slate-900 flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs">
              <img src="/logo-mark.png" alt="Globallink" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Globallink Smart IT Solution
              </h1>
              <p className="text-xs text-slate-500">Formulir Pengajuan Cuti & Lampiran Serah Terima Amanah</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
            <Link
              href="/"
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>Menu Utama</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 font-medium">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800 font-medium">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleGeneratePdf} className="space-y-6">

          {/* ================= SECTION 1: DATA PEMOHON & ATASAN ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Data Pemohon & Atasan Langsung
                  </h2>
                  <p className="text-xs text-slate-500">
                    Informasi identitas pemohon dan atasan yang menyetujui pengajuan cuti
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full border border-blue-200">
                Halaman 1
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Nama Lengkap Pemohon *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.nama}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Rinaldi Ihwal"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    ID Karyawan *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                    value={formData.id_karyawan}
                    onChange={e => setFormData({ ...formData, id_karyawan: e.target.value })}
                    placeholder="Contoh: GL-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Jabatan Pemohon *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.jabatan}
                    onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: IT System & IT Support"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Atasan Langsung (Penyetuju) *
                  </label>
                  <select
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                    value={formData.nama_atasan}
                    onChange={e => handleAtasanChange(e.target.value)}
                  >
                    <option value="">-- Pilih Atasan Langsung --</option>
                    {DAFTAR_ATASAN.map((atasan, i) => (
                      <option key={i} value={atasan.nama}>
                        {atasan.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Jabatan Atasan
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none"
                    value={formData.jabatan_atasan}
                    placeholder="Otomatis terisi..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: JENIS & ALASAN CUTI ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Jenis Cuti & Alasan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih kategori hak cuti yang diajukan beserta alasan keperluan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Pilih Kategori Jenis Cuti *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'Cuti Tahunan', icon: Palmtree, desc: 'Hak cuti tahunan reguler karyawan' },
                    { key: 'Cuti Melahirkan', icon: Baby, desc: 'Hak cuti melahirkan / persalinan' }
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = formData.jenis_cuti === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, jenis_cuti: item.key as any })}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                            {item.key}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Alasan Pengajuan Cuti *
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  value={formData.alasan}
                  onChange={e => setFormData({ ...formData, alasan: e.target.value })}
                  placeholder="Contoh: Ketemu Keluarga / Acara Keluarga di Luar Kota"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: PERIODE & JADWAL CUTI ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Jadwal & Periode Cuti
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rentang tanggal cuti dan kepastian tanggal mulai masuk bekerja kembali
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Tanggal Mulai Cuti *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    value={formData.tanggal_mulai}
                    onChange={e => handleStartDateChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Tanggal Selesai Cuti *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    value={formData.tanggal_selesai}
                    onChange={e => handleEndDateChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Masuk Kembali Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-semibold text-slate-900"
                    value={formData.masuk_kembali_tanggal}
                    onChange={e => setFormData({ ...formData, masuk_kembali_tanggal: e.target.value })}
                  />
                </div>
              </div>

              {formData.hari_tanggal && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Jadwal Cuti di Dokumen (Otomatis):</span>
                  </span>
                  <span className="font-bold text-amber-950 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    {formData.hari_tanggal} ({formData.cuti_akan_diambil} Hari)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================= SECTION 4: LAMPIRAN SERAH TERIMA AMANAH ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-teal-50 to-cyan-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  4
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Lampiran Serah Terima Amanah (Halaman 2 PDF)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Penunjukan rekan kerja yang menerima tanggung jawab pekerjaan selama masa cuti
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/70 px-2.5 py-1 rounded-full border border-teal-200">
                Halaman 2
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-slate-700 leading-relaxed">
                <i>"Sehubung dengan pengajuan cuti saya yang telah dilampirkan bersama ini, saya bermaksud memberikan tanggung jawab dan amanah saya, selama masa cuti saya kepada :"</i>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Nama Rekan Kerja Penerima Amanah *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    value={formData.penerima_amanah_nama}
                    onChange={e => setFormData({ ...formData, penerima_amanah_nama: e.target.value })}
                    placeholder="Contoh: Ahmad Fauzi"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Jabatan Rekan Kerja Penerima Amanah *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    value={formData.penerima_amanah_jabatan}
                    onChange={e => setFormData({ ...formData, penerima_amanah_jabatan: e.target.value })}
                    placeholder="Contoh: IT Network / Support"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 5: TANDA TANGAN PEMOHON ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  5
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Tanda Tangan Pemohon
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bubuhkan tanda tangan digital Anda untuk pengesahan formulir cuti & lampiran
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <SignaturePad
                onSave={signatureDataUrl => setFormData(prev => ({ ...prev, tanda_tangan_pemohon: signatureDataUrl }))}
                label="Tanda Tangan Pemohon (Nama Karyawan)"
                initialValue={formData.tanda_tangan_pemohon}
              />
            </div>
          </div>

          {/* ================= ACTION BUTTONS ================= */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              disabled={previewLoading}
              onClick={handlePreviewPdf}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {previewLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  <span>Membuat Preview...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Preview Dokumen</span>
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan & Mengunduh...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Generate PDF Cuti</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Modal Preview PDF */}
        {previewPdfUrl && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-800 text-sm">Preview Formulir Cuti & Lampiran PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewPdfUrl}
                    download={`Formulir_Pengajuan_Cuti_${(formData.nama || 'karyawan').replace(/\s+/g, '_')}.pdf`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (previewPdfUrl) window.URL.revokeObjectURL(previewPdfUrl);
                      setPreviewPdfUrl(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 p-2 sm:p-4">
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-full rounded-xl border border-slate-200 bg-white"
                  title="Preview Dokumen Cuti"
                />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
        © 2026 PT Globallink Smart IT Solution. All rights reserved.
      </footer>
    </div>
  );
}
