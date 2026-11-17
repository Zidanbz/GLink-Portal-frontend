'use client';

import React, { useState } from 'react';
import SignaturePad from './SignaturePad';
import DocumentPreview from './DocumentPreview';
import { X, Send, Eye, Edit3, Paperclip, AlertCircle, Calendar } from 'lucide-react';

interface NewSubmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ALASAN_GUIDELINES = [
  { key: 'a', label: 'a. Pernikahan Karyawan', days: 3 },
  { key: 'b', label: 'b. Pernikahan anak Karyawan', days: 2 },
  { key: 'c', label: 'c. Khitanan/aqiqah/membaptis anak Karyawan', days: 2 },
  { key: 'd', label: 'd. Istri Karyawan Melahirkan', days: 2 },
  { key: 'e', label: 'e. Istri/Suami/anak Karyawan meninggal dunia', days: 2 },
  { key: 'f', label: 'f. Orang tua/mertua Karyawan meninggal dunia', days: 2 },
  { key: 'g', label: 'g. Saudara kandung meninggal dunia', days: 2 },
  { key: 'h', label: 'h. Kakek/nenek/cucu/menantu/ipar/orang serumah Karyawan meninggal dunia', days: 2 },
  { key: 'i', label: 'i. Ibadah Umroh', days: 12 },
  { key: 'j', label: 'j. Kejadian Force Majeure', days: 1 },
  { key: 'other', label: 'Lainnya (Tentukan Sendiri)', days: 1 },
];

export default function NewSubmissionModal({ onClose, onSuccess }: NewSubmissionModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    jenis_izin: 'Izin tidak masuk kerja dengan menerimah upah' as
      | 'Izin Sakit'
      | 'Izin tidak masuk kerja dengan menerimah upah'
      | 'Izin tidak masuk kerja dengan potongan upah'
      | 'Izin kejadian diluar kendali ( force majeure )',
    kategori_alasan: '',
    alasan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    masuk_kembali_tanggal: '',
    tanda_tangan_pemohon: '',
  });

  const [suratDokterFile, setSuratDokterFile] = useState<File | null>(null);

  const handleGuidelineChange = (selectedLabel: string) => {
    const item = ALASAN_GUIDELINES.find(g => g.label === selectedLabel);
    if (!item) return;

    let newJenis = formData.jenis_izin;
    if (selectedLabel.includes('Force Majeure')) {
      newJenis = 'Izin kejadian diluar kendali ( force majeure )';
    } else if (item.key !== 'other') {
      newJenis = 'Izin tidak masuk kerja dengan menerimah upah';
    }

    setFormData(prev => ({
      ...prev,
      kategori_alasan: selectedLabel,
      alasan: prev.alasan ? prev.alasan : selectedLabel,
      jenis_izin: newJenis
    }));

    // Auto-calculate end date if start date is already filled
    if (formData.tanggal_mulai && item.days > 0) {
      const s = new Date(formData.tanggal_mulai);
      const e = new Date(s);
      e.setDate(s.getDate() + (item.days - 1));
      const endStr = e.toISOString().split('T')[0];

      const ret = new Date(e);
      ret.setDate(e.getDate() + 1);
      const retStr = ret.toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        tanggal_selesai: endStr,
        masuk_kembali_tanggal: retStr
      }));
    }
  };

  const handleStartDateChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, tanggal_mulai: val };
      if (val && !prev.tanggal_selesai) {
        updated.tanggal_selesai = val;
        const ret = new Date(val);
        ret.setDate(ret.getDate() + 1);
        updated.masuk_kembali_tanggal = ret.toISOString().split('T')[0];
      }
      return updated;
    });
  };

  const handleEndDateChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, tanggal_selesai: val };
      if (val) {
        const ret = new Date(val);
        ret.setDate(ret.getDate() + 1);
        updated.masuk_kembali_tanggal = ret.toISOString().split('T')[0];
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (suratDokterFile && suratDokterFile.size > 2 * 1024 * 1024) {
      setError('Lampiran maksimal 2 MB. Kompres file terlebih dahulu.');
      return;
    }

    if (!formData.nama.trim() || !formData.jabatan.trim() || !formData.alasan.trim()) {
      setError('Harap isi Nama, Jabatan, dan Alasan.');
      return;
    }
    if (!formData.tanggal_mulai || !formData.tanggal_selesai || !formData.masuk_kembali_tanggal) {
      setError('Harap tentukan tanggal mulai, tanggal selesai, dan tanggal masuk kembali.');
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append('nama', formData.nama);
      body.append('jabatan', formData.jabatan);
      body.append('jenis_izin', formData.jenis_izin);
      body.append('kategori_alasan', formData.kategori_alasan);
      body.append('alasan', formData.alasan);
      body.append('tanggal_mulai', formData.tanggal_mulai);
      body.append('tanggal_selesai', formData.tanggal_selesai);
      body.append('masuk_kembali_tanggal', formData.masuk_kembali_tanggal);
      body.append('tanda_tangan_pemohon', formData.tanda_tangan_pemohon);
      body.append('tanggal_surat', new Date().toISOString().split('T')[0]);

      if (suratDokterFile) {
        body.append('surat_dokter', suratDokterFile);
      }

      const res = await fetch('/api/pengajuan', {
        method: 'POST',
        body
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan pengajuan izin');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-300" />
              Buat Formulir Pengajuan Izin
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Isi data pengajuan izin sesuai ketentuan resmi Globallink
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-950/60 p-1 rounded-xl flex gap-1 border border-blue-400/20">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'form'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Isi Formulir
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Dokumen
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identitas Karyawan */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Identitas Karyawan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.nama}
                      onChange={e => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Jabatan / Divisi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Software Engineer"
                      value={formData.jabatan}
                      onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Jenis Izin */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Jenis Izin (Sesuai Formulir Resmi)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'Izin Sakit',
                      title: 'Izin Sakit',
                      desc: 'Wajib lampirkan surat dokter setelah masuk kembali'
                    },
                    {
                      id: 'Izin tidak masuk kerja dengan menerimah upah',
                      title: 'Izin Menerima Upah (Paid Leave)',
                      desc: 'Pernikahan, melahirkan, duka cita, umroh, dll'
                    },
                    {
                      id: 'Izin tidak masuk kerja dengan potongan upah',
                      title: 'Izin Potongan Upah (Unpaid Leave)',
                      desc: 'Keperluan pribadi di luar hak cuti upah'
                    },
                    {
                      id: 'Izin kejadian diluar kendali ( force majeure )',
                      title: 'Izin Force Majeure',
                      desc: 'Bencana alam, banjir, kejadian darurat di luar kendali'
                    }
                  ].map(item => (
                    <label
                      key={item.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        formData.jenis_izin === item.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="jenis_izin"
                        value={item.id}
                        checked={formData.jenis_izin === item.id}
                        onChange={e => setFormData({ ...formData, jenis_izin: e.target.value as any })}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ketentuan Alasan Standard */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Alasan & Kategori Izin
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Kategori Alasan (Tabel Hak Izin Resmi)
                  </label>
                  <select
                    value={formData.kategori_alasan}
                    onChange={e => handleGuidelineChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                  >
                    <option value="">-- Pilih Alasan Sesuai Tabel Ketentuan --</option>
                    {ALASAN_GUIDELINES.map(g => (
                      <option key={g.key} value={g.label}>
                        {g.label} ({g.days} Hari)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deskripsi Alasan Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Tuliskan keterangan detail alasan pengajuan izin..."
                    value={formData.alasan}
                    onChange={e => setFormData({ ...formData, alasan: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Tanggal Pelaksanaan Izin */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Periode Izin & Masuk Kembali
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tanggal Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_mulai}
                      onChange={e => handleStartDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tanggal Selesai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_selesai}
                      onChange={e => handleEndDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Masuk Kembali Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.masuk_kembali_tanggal}
                      onChange={e => setFormData({ ...formData, masuk_kembali_tanggal: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Lampiran Surat Dokter (Jika Izin Sakit) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Lampiran (Surat Dokter / Bukti Pendukung)
                </h3>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="file-surat-dokter"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSuratDokterFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="file-surat-dokter" className="cursor-pointer block">
                    <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                      {suratDokterFile ? suratDokterFile.name : 'Klik untuk unggah surat keterangan sakit / bukti izin'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format PDF, JPG, PNG (Maks 2MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Tanda Tangan Pemohon */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <SignaturePad
                  label="Tanda Tangan Pemohon (Karyawan)"
                  onSave={dataUrl => setFormData(prev => ({ ...prev, tanda_tangan_pemohon: dataUrl }))}
                  initialValue={formData.tanda_tangan_pemohon}
                  height={130}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md hover:shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Ajukan Surat Izin
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Ini adalah preview langsung dari dokumen PDF yang akan dicetak persis dengan template <strong>Surat ijin.docx</strong>.
                </span>
              </div>
              <div className="flex justify-center">
                <DocumentPreview
                  data={{
                    ...formData,
                    status_persetujuan: 'Menunggu Persetujuan',
                    tanggal_surat: new Date().toISOString()
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
