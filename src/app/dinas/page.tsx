'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SignaturePad from '@/components/SignaturePad';
import {
  Briefcase,
  Calendar,
  User,
  MapPin,
  Car,
  FileDown,
  Eye,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  CalendarDays,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';
import { DAFTAR_ATASAN } from '@/constants/atasan';

interface AnggaranItem {
  no: string;
  deskripsi: string;
  qty: number | string;
  harga_satuan: number | string;
  jumlah: number | string;
}

interface ItineraryItem {
  no: string;
  kegiatan: string;
  tempat: string;
  waktu_kegiatan: string;
}

export default function PengajuanDinasPage() {
  const [formData, setFormData] = useState({
    nomor_surat: '',
    nomor_nota: '',
    tanggal_surat: '',
    pemberi_tugas_nama: '',
    pemberi_tugas_jabatan: '',
    penerima_tugas_nama: '',
    penerima_tugas_id_karyawan: '',
    penerima_tugas_jabatan: '',
    tujuan_dinas: '',
    kegiatan: '',
    hari_tanggal: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    maker_nama: '',
    maker_jabatan: '',
    maker_tanda_tangan: '',
    acknowledge_nama: '',
    acknowledge_jabatan: '',
    pemberi_tugas_tanda_tangan: ''
  });

  const [anggaranList, setAnggaranList] = useState<AnggaranItem[]>([
    { no: '1', deskripsi: '', qty: '', harga_satuan: '', jumlah: 0 }
  ]);

  const [itineraryList, setItineraryList] = useState<ItineraryItem[]>([
    { no: '1', kegiatan: '', tempat: '', waktu_kegiatan: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const fetchNomorTerbaru = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/pengajuan-dinas/nomor-terbaru', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal memuat nomor surat terbaru');
      const json = await res.json();
      if (json.success) {
        setFormData(prev => ({
          ...prev,
          nomor_surat: json.nomor_surat,
          nomor_nota: json.nomor_nota,
          tanggal_surat: json.tanggal_surat
        }));
      }
    } catch (e) {
      console.warn('Could not fetch latest dinas numbers', e);
      setError('Nomor surat terbaru belum dapat dimuat. Pastikan backend dan database aktif.');
    }
  };

  useEffect(() => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(new Date());
    setFormData(prev => ({
      ...prev,
      tanggal_surat: today,
      tanggal_mulai: today,
      tanggal_selesai: today
    }));
    updateHariTanggalText(today, today);
    fetchNomorTerbaru();
  }, []);

  // Format date range text in Indonesian
  const handleStartDateChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, tanggal_mulai: val };
      if (val && !prev.tanggal_selesai) {
        updated.tanggal_selesai = val;
      }
      return updated;
    });
    updateHariTanggalText(val, formData.tanggal_selesai || val);
  };

  const handleEndDateChange = (val: string) => {
    setFormData(prev => ({ ...prev, tanggal_selesai: val }));
    updateHariTanggalText(formData.tanggal_mulai || val, val);
  };

  const updateHariTanggalText = (start: string, end: string) => {
    if (!start) return;
    try {
      const s = new Date(start);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const dayName = days[s.getDay()];
      const dayNum = s.getDate();
      const monthName = months[s.getMonth()];
      const year = s.getFullYear();

      if (!end || start === end) {
        setFormData(prev => ({ ...prev, hari_tanggal: `${dayName}, ${dayNum} ${monthName} ${year}` }));
      } else {
        const e = new Date(end);
        const endDayName = days[e.getDay()];
        const endDayNum = e.getDate();
        const endMonthName = months[e.getMonth()];
        const endYear = e.getFullYear();
        if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
          setFormData(prev => ({ ...prev, hari_tanggal: `${dayName} - ${endDayName}, ${dayNum} - ${endDayNum} ${monthName} ${year}` }));
        } else {
          setFormData(prev => ({ ...prev, hari_tanggal: `${dayName}, ${dayNum} ${monthName} ${year} s/d ${endDayName}, ${endDayNum} ${endMonthName} ${endYear}` }));
        }
      }
    } catch {}
  };

  const handleAtasanChange = (selectedNama: string) => {
    const found = DAFTAR_ATASAN.find(a => a.nama === selectedNama);
    if (found) {
      setFormData(prev => ({
        ...prev,
        pemberi_tugas_nama: found.nama,
        pemberi_tugas_jabatan: found.jabatan,
        acknowledge_nama: found.nama,
        acknowledge_jabatan: found.jabatan
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        pemberi_tugas_nama: '',
        pemberi_tugas_jabatan: '',
        acknowledge_nama: '',
        acknowledge_jabatan: ''
      }));
    }
  };

  // Anggaran functions
  const handleAddAnggaran = () => {
    setAnggaranList(prev => [
      ...prev,
      { no: String(prev.length + 1), deskripsi: '', qty: '', harga_satuan: '', jumlah: 0 }
    ]);
  };

  const handleRemoveAnggaran = (index: number) => {
    setAnggaranList(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.map((item, idx) => ({ ...item, no: String(idx + 1) }));
    });
  };

  const handleAnggaranChange = (index: number, field: keyof AnggaranItem, value: any) => {
    setAnggaranList(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'qty' || field === 'harga_satuan') {
        const q = Number(item.qty) || 0;
        const h = Number(item.harga_satuan) || 0;
        item.jumlah = q * h;
      }
      updated[index] = item;
      return updated;
    });
  };

  const totalAnggaran = anggaranList.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

  // Itinerary functions
  const handleAddItinerary = () => {
    setItineraryList(prev => [
      ...prev,
      { no: String(prev.length + 1), kegiatan: '', tempat: '', waktu_kegiatan: '' }
    ]);
  };

  const handleRemoveItinerary = (index: number) => {
    setItineraryList(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.map((item, idx) => ({ ...item, no: String(idx + 1) }));
    });
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string) => {
    setItineraryList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Smart bullet / numbered list continuation on Enter in Uraian Pekerjaan
  const handleKegiatanKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;

      // Current text before & after selection
      const textBeforeCursor = value.substring(0, selectionStart);
      const textAfterCursor = value.substring(selectionEnd);
      const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
      const lineStartIndex = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      const currentLine = textBeforeCursor.substring(lineStartIndex);

      // Check if current line starts with numbered list (e.g., "1. ", "1) ")
      const numberMatch = currentLine.match(/^(\s*)(\d+)[\.\)]\s*(.*)$/);
      // Check if current line starts with bullet list (e.g., "• ", "- ", "* ")
      const bulletMatch = currentLine.match(/^(\s*)([•\-\*])\s*(.*)$/);

      if (numberMatch) {
        e.preventDefault();
        const indent = numberMatch[1];
        const num = parseInt(numberMatch[2], 10);
        const content = numberMatch[3];

        // If user presses Enter on an empty numbered line (e.g. "2. "), remove the prefix and exit list
        if (!content.trim() && currentLine.trim() === `${num}.`) {
          const newValue = value.substring(0, lineStartIndex) + textAfterCursor;
          setFormData(prev => ({ ...prev, kegiatan: newValue }));
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStartIndex;
          }, 0);
          return;
        }

        const nextPrefix = `\n${indent}${num + 1}. `;
        const newValue = textBeforeCursor + nextPrefix + textAfterCursor;
        setFormData(prev => ({ ...prev, kegiatan: newValue }));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + nextPrefix.length;
        }, 0);
        return;
      }

      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        const symbol = bulletMatch[2];
        const content = bulletMatch[3];

        // If user presses Enter on an empty bullet line, remove the prefix and exit list
        if (!content.trim() && currentLine.trim() === symbol) {
          const newValue = value.substring(0, lineStartIndex) + textAfterCursor;
          setFormData(prev => ({ ...prev, kegiatan: newValue }));
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStartIndex;
          }, 0);
          return;
        }

        const nextPrefix = `\n${indent}${symbol} `;
        const newValue = textBeforeCursor + nextPrefix + textAfterCursor;
        setFormData(prev => ({ ...prev, kegiatan: newValue }));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + nextPrefix.length;
        }, 0);
        return;
      }

      // If current line does not have a number or bullet yet:
      // Turn current line into "1. <currentLine>" and next line into "2. "
      e.preventDefault();

      const linesBefore = textBeforeCursor.substring(0, lineStartIndex).split('\n');
      let highestPrevNum = 0;
      for (let i = linesBefore.length - 1; i >= 0; i--) {
        const m = linesBefore[i].match(/^\s*(\d+)[\.\)]/);
        if (m) {
          highestPrevNum = parseInt(m[1], 10);
          break;
        }
      }

      const currentNum = highestPrevNum > 0 ? highestPrevNum + 1 : 1;
      const nextNum = currentNum + 1;

      if (currentLine.trim()) {
        const beforeCurrentLine = textBeforeCursor.substring(0, lineStartIndex);
        const currentLineText = textBeforeCursor.substring(lineStartIndex);
        const prefixForCurrent = `${currentNum}. `;
        const nextPrefix = `\n${nextNum}. `;

        const newValue = beforeCurrentLine + prefixForCurrent + currentLineText + nextPrefix + textAfterCursor;
        setFormData(prev => ({ ...prev, kegiatan: newValue }));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + prefixForCurrent.length + nextPrefix.length;
        }, 0);
      } else {
        const prefix = `${currentNum}. `;
        const newValue = textBeforeCursor + prefix + textAfterCursor;
        setFormData(prev => ({ ...prev, kegiatan: newValue }));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + prefix.length;
        }, 0);
      }
    }
  };

  const handleInsertPointPrefix = (type: 'number' | 'bullet') => {
    setFormData(prev => {
      const current = prev.kegiatan || '';
      if (!current.trim()) {
        return { ...prev, kegiatan: type === 'number' ? '1. ' : '• ' };
      }
      const lines = current.split('\n');
      const formatted = lines.map((line, idx) => {
        const trimmed = line.trim();
        const clean = trimmed.replace(/^(\d+[\.\)]|[•\-\*])\s*/, '');
        if (!clean) return line;
        return type === 'number' ? `${idx + 1}. ${clean}` : `• ${clean}`;
      }).join('\n');
      return { ...prev, kegiatan: formatted };
    });
  };

  // Reset form
  const handleResetForm = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh isian formulir dinas?')) {
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(new Date());
      setFormData({
        nomor_surat: '',
        nomor_nota: '',
        tanggal_surat: today,
        pemberi_tugas_nama: '',
        pemberi_tugas_jabatan: '',
        penerima_tugas_nama: '',
        penerima_tugas_id_karyawan: '',
        penerima_tugas_jabatan: '',
            tujuan_dinas: '',
        kegiatan: '',
        hari_tanggal: '',
        tanggal_mulai: today,
        tanggal_selesai: today,
        maker_nama: '',
        maker_jabatan: '',
        maker_tanda_tangan: '',
        acknowledge_nama: '',
        acknowledge_jabatan: '',
        pemberi_tugas_tanda_tangan: ''
      });
      setAnggaranList([
        { no: '1', deskripsi: '', qty: '', harga_satuan: '', jumlah: 0 }
      ]);
      setItineraryList([
        { no: '1', kegiatan: '', tempat: '', waktu_kegiatan: '' }
      ]);
      setError(null);
      setSuccessMessage(null);
      fetchNomorTerbaru();
    }
  };

  // Preview PDF Modal
  const handlePreviewPdf = async () => {
    setError(null);
    setPreviewLoading(true);

    try {
      const payload = {
        ...formData,
        maker_nama: formData.penerima_tugas_nama,
        maker_jabatan: formData.penerima_tugas_jabatan,
        anggaran_items: anggaranList,
        total_anggaran: totalAnggaran,
        itinerary_items: itineraryList
      };

      const res = await fetch('http://localhost:5001/api/pengajuan-dinas/preview-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Gagal menghasilkan preview PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memuat preview dokumen.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Submit and download PDF
  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.penerima_tugas_nama.trim()) {
      setError('Mohon isi nama karyawan yang ditugaskan.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    if (!formData.kegiatan.trim()) {
      setError('Mohon isi uraian kegiatan pekerjaan dinas.');
      return;
    }

    if (!formData.tujuan_dinas.trim()) {
      setError('Mohon isi kota / tempat tujuan dinas.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        maker_nama: formData.penerima_tugas_nama,
        maker_jabatan: formData.penerima_tugas_jabatan,
        anggaran_items: anggaranList,
        total_anggaran: totalAnggaran,
        itinerary_items: itineraryList
      };

      const res = await fetch('http://localhost:5001/api/pengajuan-dinas/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Gagal membuat dokumen PDF');
      }

      const blob = await res.blob();
      let filename = `Surat_Tugas_Dinas_${formData.penerima_tugas_nama.replace(/\s+/g, '_')}.pdf`;
      const disposition = res.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      await fetchNomorTerbaru();
      setSuccessMessage(`Berhasil! Dokumen resmi 3 halaman "${filename}" telah selesai di-generate dan otomatis diunduh ke perangkat Anda.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memproses PDF dinas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center p-1 shadow-xs overflow-hidden">
                <img
                  src="/logo-mark.png"
                  alt="Globallink Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Globallink Smart IT Solution
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formulir Pengajuan Surat Tugas Dinas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Menu Utama</span>
              </Link>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        
        {/* Banner Alert Feedback */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Peringatan</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Pengajuan Berhasil</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleGeneratePdf} className="space-y-6">

          {/* ================= SECTION 1: SURAT TUGAS DINAS ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Surat Tugas Dinas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Informasi pemberi tugas, personel pelaksana, dan uraian penugasan
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-full border border-indigo-200">
                STD Template
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Nomor Surat, Nomor Nota & Tanggal Surat Bar (Locked / Sistem Otomatis) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Nomor Surat Tugas (STD)</span>
                    </label>
                    <span className="text-[10px] text-slate-600 font-semibold bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                      🔒 Terkunci
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="w-full px-3 py-2 text-base sm:text-sm font-mono font-bold rounded-lg border border-slate-200 bg-slate-100/90 text-slate-700 tracking-wide cursor-not-allowed select-all shadow-inner focus:outline-none"
                    value={formData.nomor_surat}
                    placeholder="Memuat nomor surat..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Perkiraan nomor berikutnya; nomor final ditetapkan saat Generate PDF
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Nomor Nota Anggaran Dinas</span>
                    </label>
                    <span className="text-[10px] text-slate-600 font-semibold bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                      🔒 Terkunci
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="w-full px-3 py-2 text-base sm:text-sm font-mono font-bold rounded-lg border border-slate-200 bg-slate-100/90 text-slate-700 tracking-wide cursor-not-allowed select-all shadow-inner focus:outline-none"
                    value={formData.nomor_nota}
                    placeholder="Memuat nomor nota..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Nomor nota final ditetapkan saat Generate PDF
                  </p>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Tanggal Surat Dibuat</span>
                    </label>
                    <span className="text-[10px] text-slate-600 font-semibold bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                      🔒 Tanggal Hari Ini
                    </span>
                  </div>
                  <input
                    type="date"
                    readOnly
                    tabIndex={-1}
                    className="w-full px-3 py-2 text-base sm:text-sm font-medium rounded-lg border border-slate-200 bg-slate-100/90 text-slate-700 cursor-not-allowed shadow-inner focus:outline-none"
                    value={formData.tanggal_surat}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Otomatis mengikuti tanggal pembuatan dokumen hari ini
                  </p>
                </div>
              </div>

              {/* Pemberi Tugas & Penerima Tugas Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Kolom Kiri: Pemberi Tugas */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Pemberi Tugas (Atasan / HRD)
                  </span>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Pemberi Tugas (Pilih Atasan) *
                    </label>
                    <select
                      value={formData.pemberi_tugas_nama}
                      onChange={e => handleAtasanChange(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Atasan / Pemberi Tugas --</option>
                      {DAFTAR_ATASAN.map(a => (
                        <option key={a.nama} value={a.nama}>
                          {a.nama} — {a.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Jabatan Pemberi Tugas</span>
                      <span className="text-[11px] font-normal text-indigo-600">Otomatis terisi</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-800 font-semibold cursor-not-allowed"
                      value={formData.pemberi_tugas_jabatan}
                      placeholder="Jabatan akan otomatis terpilih..."
                    />
                  </div>
                </div>

                {/* Kolom Kanan: Penerima Tugas */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 space-y-3">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                    Penerima Tugas (Karyawan Ditugaskan) *
                  </span>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Lengkap Karyawan *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={formData.penerima_tugas_nama}
                      onChange={e => setFormData({ ...formData, penerima_tugas_nama: e.target.value })}
                      placeholder="Contoh: Wandi Putra Wirawan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        ID Karyawan
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={formData.penerima_tugas_id_karyawan}
                        onChange={e => setFormData({ ...formData, penerima_tugas_id_karyawan: e.target.value })}
                        placeholder="GL-001"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Jabatan *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={formData.penerima_tugas_jabatan}
                        onChange={e => setFormData({ ...formData, penerima_tugas_jabatan: e.target.value })}
                        placeholder="Contoh: Driver"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Kegiatan & Lokasi */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Uraian Pekerjaan / Kegiatan Dinas *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        💡 Tekan Enter untuk poin baru otomatis
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInsertPointPrefix('number')}
                        className="px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded border border-slate-200 transition-colors cursor-pointer"
                        title="Format nomor 1, 2, 3"
                      >
                        1. 2. 3. Angka
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertPointPrefix('bullet')}
                        className="px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded border border-slate-200 transition-colors cursor-pointer"
                        title="Format bullet •"
                      >
                        • Bullet
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-normal leading-relaxed"
                    value={formData.kegiatan}
                    onChange={e => setFormData({ ...formData, kegiatan: e.target.value })}
                    onKeyDown={handleKegiatanKeyDown}
                    placeholder="Contoh:&#10;1. Membawa unit mobil untuk dilakukan serah terima di Toraja&#10;2. Pendaftaran Tender BP TAPERA"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Kota / Lokasi Tujuan *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={formData.tujuan_dinas}
                      onChange={e => setFormData({ ...formData, tujuan_dinas: e.target.value })}
                      placeholder="Contoh: Kota Toraja / Kota Jakarta"
                    />
                  </div>

                </div>

                {/* Periode Tanggal (Otomatis Menghasilkan Hari & Tanggal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Tanggal Mulai Dinas *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={formData.tanggal_mulai}
                      onChange={e => handleStartDateChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Tanggal Selesai Dinas *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={formData.tanggal_selesai}
                      onChange={e => handleEndDateChange(e.target.value)}
                    />
                  </div>
                </div>

                {formData.hari_tanggal && (
                  <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span>✨ Hari & Tanggal di Dokumen (Otomatis):</span>
                    </span>
                    <span className="font-semibold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      {formData.hari_tanggal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* ================= SECTION 2: ITINERARY / KEGIATAN PERJALANAN ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-teal-50 to-emerald-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Lampiran Kegiatan Perjalanan (Itinerary)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daftar tahapan agenda kegiatan perjalanan dinas (Halaman 2 PDF)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddItinerary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2 px-2 w-10 text-center font-bold">No</th>
                      <th className="py-2 px-3 font-bold">Kegiatan</th>
                      <th className="py-2 px-3 w-40 font-bold">Tempat</th>
                      <th className="py-2 px-3 w-36 font-bold">Waktu Kegiatan</th>
                      <th className="py-2 px-2 w-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itineraryList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic bg-slate-50/50">
                          Belum ada rincian agenda perjalanan.{' '}
                          <button
                            type="button"
                            onClick={handleAddItinerary}
                            className="text-teal-600 hover:text-teal-700 underline font-semibold ml-1 cursor-pointer"
                          >
                            + Tambah Baris
                          </button>{' '}
                          jika terdapat lampiran itinerary kegiatan.
                        </td>
                      </tr>
                    ) : (
                      itineraryList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2 text-center font-bold text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 text-base sm:text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                              value={row.kegiatan}
                              onChange={e => handleItineraryChange(idx, 'kegiatan', e.target.value)}
                              placeholder="Deskripsi kegiatan dinas..."
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 text-base sm:text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                              value={row.tempat}
                              onChange={e => handleItineraryChange(idx, 'tempat', e.target.value)}
                              placeholder="Kota / lokasi..."
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 text-base sm:text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                              value={row.waktu_kegiatan}
                              onChange={e => handleItineraryChange(idx, 'waktu_kegiatan', e.target.value)}
                              placeholder="Contoh: 21 Oktober 2026"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItinerary(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          {/* ================= SECTION 3: ANGGARAN & BIAYA OPERASIONAL ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Estimasi Anggaran & Biaya Operasional
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rincian nota biaya dinas ke Finance (Halaman 1 PDF)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAnggaran}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Biaya</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2 px-2 w-12 text-center font-bold">No</th>
                      <th className="py-2 px-3 font-bold">Deskripsi Biaya</th>
                      <th className="py-2 px-3 w-20 text-center font-bold">Qty</th>
                      <th className="py-2 px-3 w-36 font-bold">Harga Satuan (Rp)</th>
                      <th className="py-2 px-3 w-36 font-bold">Jumlah (Rp)</th>
                      <th className="py-2 px-2 w-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {anggaranList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic bg-slate-50/50">
                          Belum ada rincian estimasi biaya.{' '}
                          <button
                            type="button"
                            onClick={handleAddAnggaran}
                            className="text-blue-600 hover:text-blue-700 underline font-semibold ml-1 cursor-pointer"
                          >
                            + Tambah Biaya
                          </button>{' '}
                          jika memerlukan anggaran operasional.
                        </td>
                      </tr>
                    ) : (
                      anggaranList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2 text-center font-bold text-slate-600">
                            <input
                              type="text"
                              className="w-10 text-center px-1 py-1 text-base sm:text-xs rounded border border-slate-200 bg-white"
                              value={row.no}
                              onChange={e => handleAnggaranChange(idx, 'no', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 text-base sm:text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              value={row.deskripsi}
                              onChange={e => handleAnggaranChange(idx, 'deskripsi', e.target.value)}
                              placeholder="Deskripsi biaya operasional..."
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              className="w-16 text-center px-2 py-1.5 text-base sm:text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              value={row.qty}
                              onChange={e => handleAnggaranChange(idx, 'qty', e.target.value)}
                              placeholder="1"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              className="w-full px-2.5 py-1.5 text-base sm:text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              value={row.harga_satuan}
                              onChange={e => handleAnggaranChange(idx, 'harga_satuan', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="py-2 px-2 font-bold text-slate-800">
                            Rp {(Number(row.jumlah) || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAnggaran(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-sm">
                      <td colSpan={4} className="py-3 px-4 text-right text-slate-700">
                        TOTAL ANGGARAN OPERASIONAL :
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-blue-700 text-base font-extrabold">
                        Rp {totalAnggaran.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>


          {/* ================= SECTION 4: TANDA TANGAN PENERIMA TUGAS (PEMOHON) ================= */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <SignaturePad
              label={`Tanda Tangan Pemohon / Penerima Tugas ${formData.penerima_tugas_nama ? `(${formData.penerima_tugas_nama})` : ''}`}
              onSave={dataUrl => setFormData(prev => ({ ...prev, maker_tanda_tangan: dataUrl }))}
              initialValue={formData.maker_tanda_tangan}
              height={140}
            />
          </div>


          {/* ================= ACTION BUTTONS (SEPERTI MENU IZIN) ================= */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-3.5">
            {/* Button Preview Dokumen */}
            <button
              type="button"
              onClick={handlePreviewPdf}
              disabled={previewLoading || loading}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{previewLoading ? 'Memuat Preview...' : 'Preview Dokumen'}</span>
            </button>

            {/* Button Generate PDF */}
            <button
              type="submit"
              disabled={loading || previewLoading}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Membuat & Mengunduh PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  <span>Generate PDF</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      {/* ================= MODAL PREVIEW PDF ================= */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold leading-none">
                    Preview Surat Tugas Dinas Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format Dokumen Resmi 3 Halaman dengan Kop Baru
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  download={`Preview_Surat_Tugas_Dinas_${formData.penerima_tugas_nama || 'karyawan'}.pdf`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    window.URL.revokeObjectURL(previewPdfUrl);
                    setPreviewPdfUrl(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Viewer */}
            <div className="flex-1 bg-slate-200">
              <iframe
                src={`${previewPdfUrl}#toolbar=1`}
                className="w-full h-full border-none"
                title="Preview Dokumen Dinas"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-10">
        © 2026 PT Globallink Smart IT Solution. All rights reserved.
      </footer>
    </div>
  );
}
