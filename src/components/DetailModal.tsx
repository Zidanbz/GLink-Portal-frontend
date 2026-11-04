'use client';

import React from 'react';
import { PengajuanIzin } from '@/types';
import { X, FileText, Download, Calendar, User, Briefcase, Paperclip, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface DetailModalProps {
  item: PengajuanIzin;
  onClose: () => void;
  onPreview: () => void;
  onApproval: () => void;
}

export default function DetailModal({ item, onClose, onPreview, onApproval }: DetailModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui
          </span>
        );
      case 'Ditangguhkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Ditangguhkan
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Persetujuan
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Detail Pengajuan Izin
            </h2>
            <p className="text-xs text-slate-400">{item.nomor_surat}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[78vh] bg-slate-50/50">
          {/* Status Banner */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <div className="text-xs text-slate-500 font-medium">Status Pengajuan:</div>
              <div className="mt-1">{getStatusBadge(item.status_persetujuan)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Tanggal Surat:</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {formatDate(item.tanggal_surat)}
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Informasi Pemohon
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">Nama Karyawan</div>
                  <div className="font-bold text-slate-800 text-sm">{item.nama}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">Jabatan</div>
                  <div className="font-semibold text-slate-800">{item.jabatan}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rincian Pengajuan Izin
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-slate-500">Jenis Izin: </span>
                <span className="font-bold text-slate-800">{item.jenis_izin}</span>
              </div>
              {item.kategori_alasan && (
                <div>
                  <span className="text-slate-500">Kategori Alasan: </span>
                  <span className="font-semibold text-slate-700">{item.kategori_alasan}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Alasan: </span>
                <span className="font-medium text-slate-800">{item.alasan}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-blue-800">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Periode: <strong>{formatDate(item.tanggal_mulai)}</strong> s.d. <strong>{formatDate(item.tanggal_selesai)}</strong>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Masuk Kembali: </span>
                  <span className="font-semibold text-slate-800">{formatDate(item.masuk_kembali_tanggal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Surat Dokter Attachment */}
          {item.surat_dokter_url && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Lampiran Surat Dokter / Bukti</div>
                  <div className="text-[11px] text-slate-500">Tersedia dokumen pendukung</div>
                </div>
              </div>
              <a
                href={`${item.surat_dokter_url}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Lihat Berkas
              </a>
            </div>
          )}

          {/* Supervisor Decision Note */}
          {(item.alasan_atasan || item.ditangguhkan_mulai || item.nama_atasan) && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Catatan Persetujuan
              </h3>
              {item.nama_atasan && (
                <div>
                  <span className="text-slate-500">Disetujui Oleh: </span>
                  <span className="font-semibold text-slate-800">{item.nama_atasan}</span>
                </div>
              )}
              {item.ditangguhkan_mulai && (
                <div className="text-blue-700 font-medium">
                  Ditangguhkan menjadi: {formatDate(item.ditangguhkan_mulai)} s.d. {formatDate(item.ditangguhkan_selesai)}
                </div>
              )}
              {item.alasan_atasan && (
                <div>
                  <span className="text-slate-500">Keterangan Atasan: </span>
                  <span className="text-slate-800">{item.alasan_atasan}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Preview Surat Resmi
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onApproval}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-sm"
            >
              Ubah Persetujuan
            </button>
            <a
              href={`/api/pengajuan/${item.id}/pdf?download=1`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
