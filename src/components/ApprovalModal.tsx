'use client';

import React, { useState } from 'react';
import { PengajuanIzin } from '@/types';
import SignaturePad from './SignaturePad';
import { X, CheckCircle2, Clock, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApprovalModalProps {
  item: PengajuanIzin;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApprovalModal({ item, onClose, onSuccess }: ApprovalModalProps) {
  const [status, setStatus] = useState<'Disetujui' | 'Ditangguhkan' | 'Ditolak'>(
    item.status_persetujuan === 'Menunggu Persetujuan' ? 'Disetujui' : (item.status_persetujuan as any)
  );
  const [alasanAtasan, setAlasanAtasan] = useState(item.alasan_atasan || '');
  const [ditangguhkanMulai, setDitangguhkanMulai] = useState(
    item.ditangguhkan_mulai ? item.ditangguhkan_mulai.split('T')[0] : ''
  );
  const [ditangguhkanSelesai, setDitangguhkanSelesai] = useState(
    item.ditangguhkan_selesai ? item.ditangguhkan_selesai.split('T')[0] : ''
  );
  const [namaAtasan, setNamaAtasan] = useState(item.nama_atasan || 'Ir. M. Rahmat, S.T.');
  const [ttdAtasan, setTtdAtasan] = useState(item.tanda_tangan_atasan || '');
  const [namaHrd, setNamaHrd] = useState(item.nama_hrd || 'HRD Globallink');
  const [parafHrd, setParafHrd] = useState(item.paraf_hrd || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (status === 'Ditangguhkan' && (!ditangguhkanMulai || !ditangguhkanSelesai)) {
      setError('Harap tentukan tanggal penangguhan (mulai s.d selesai).');
      return;
    }
    if ((status === 'Ditolak' || status === 'Ditangguhkan') && !alasanAtasan.trim()) {
      setError('Harap tuliskan alasan penolakan atau penangguhan.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/pengajuan/${item.id}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_persetujuan: status,
          ditangguhkan_mulai: status === 'Ditangguhkan' ? ditangguhkanMulai : null,
          ditangguhkan_selesai: status === 'Ditangguhkan' ? ditangguhkanSelesai : null,
          alasan_atasan: alasanAtasan,
          nama_atasan: namaAtasan,
          tanda_tangan_atasan: ttdAtasan,
          nama_hrd: namaHrd,
          paraf_hrd: parafHrd
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan persetujuan');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Persetujuan Atasan Langsung & HRD</h2>
              <p className="text-xs text-slate-400">
                {item.nomor_surat} • {item.nama} ({item.jabatan})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick info summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Jenis Izin:</span>
              <span className="font-semibold text-slate-800">{item.jenis_izin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Alasan:</span>
              <span className="font-semibold text-slate-800">{item.alasan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Periode Pengajuan:</span>
              <span className="font-semibold text-blue-700">
                {item.tanggal_mulai?.split('T')[0]} s.d. {item.tanggal_selesai?.split('T')[0]} (Masuk: {item.masuk_kembali_tanggal?.split('T')[0]})
              </span>
            </div>
          </div>

          {/* Decision Status Options */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Keputusan Persetujuan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Disetujui',
                  title: 'Disetujui',
                  icon: CheckCircle2,
                  activeColor: 'border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-1 ring-emerald-500'
                },
                {
                  id: 'Ditangguhkan',
                  title: 'Ditangguhkan',
                  icon: Clock,
                  activeColor: 'border-blue-500 bg-blue-50/50 text-blue-800 ring-1 ring-blue-500'
                },
                {
                  id: 'Ditolak',
                  title: 'Ditolak',
                  icon: XCircle,
                  activeColor: 'border-rose-500 bg-rose-50/50 text-rose-800 ring-1 ring-rose-500'
                }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id as any)}
                    className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                      isSelected
                        ? opt.activeColor
                        : 'border-slate-200 bg-slate-50/30 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {opt.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Postponed: date fields */}
          {status === 'Ditangguhkan' && (
            <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-3">
              <div className="text-xs font-bold text-blue-800">
                Ditangguhkan Menjadi Tanggal:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="date"
                    required
                    value={ditangguhkanMulai}
                    onChange={e => setDitangguhkanMulai(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">S.d Tanggal</label>
                  <input
                    type="date"
                    required
                    value={ditangguhkanSelesai}
                    onChange={e => setDitangguhkanSelesai(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reason if rejected or postponed */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alasan Atasan {status !== 'Disetujui' && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={2}
              placeholder={status === 'Disetujui' ? 'Keterangan tambahan (opsional)...' : 'Tuliskan alasan penolakan/penangguhan...'}
              value={alasanAtasan}
              onChange={e => setAlasanAtasan(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
            />
          </div>

          {/* Supervisor Signature & HRD Paraf */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Atasan Langsung
                </label>
                <input
                  type="text"
                  value={namaAtasan}
                  onChange={e => setNamaAtasan(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 mb-2"
                />
                <SignaturePad
                  label="Tanda Tangan Atasan Langsung"
                  onSave={url => setTtdAtasan(url)}
                  initialValue={ttdAtasan}
                  height={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Petugas HRD
                </label>
                <input
                  type="text"
                  value={namaHrd}
                  onChange={e => setNamaHrd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 mb-2"
                />
                <SignaturePad
                  label="Paraf / Tanda Tangan HRD"
                  onSave={url => setParafHrd(url)}
                  initialValue={parafHrd}
                  height={100}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              Simpan Persetujuan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
