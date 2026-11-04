'use client';

import React from 'react';
import LeaveGuidelinesTable from '@/components/LeaveGuidelinesTable';
import { PengajuanIzin } from '@/types';
import { Download, Printer, X, FileText } from 'lucide-react';

interface DocumentPreviewProps {
  data: Partial<PengajuanIzin>;
  onClose?: () => void;
  isModal?: boolean;
}

export default function DocumentPreview({ data, onClose, isModal = false }: DocumentPreviewProps) {
  const isSakit = data.jenis_izin === 'Izin Sakit';
  const isUpah = data.jenis_izin === 'Izin tidak masuk kerja' || data.jenis_izin === 'Izin tidak masuk kerja dengan menerimah upah';
  const isPotong = data.jenis_izin === 'Izin tidak masuk kerja dengan potongan upah';
  const isForceMajeure = data.jenis_izin === 'Izin kejadian diluar kendali ( force majeure )';


  const isApproved = data.status_persetujuan === 'Disetujui';
  const isPostponed = data.status_persetujuan === 'Ditangguhkan';
  const isRejected = data.status_persetujuan === 'Ditolak';

  const formatDateIndo = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start) return '';
    const sStr = formatDateIndo(start);
    if (!end || start === end) return sStr;
    const eStr = formatDateIndo(end);
    return `${sStr} s.d. ${eStr}`;
  };

  const getSuratDateFormatted = (dateStr?: string | null) => {
    if (!dateStr) {
      try {
        return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return '22 Oktober 2026';
      }
    }
    return formatDateIndo(dateStr);
  };


  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (data.id) {
      window.open(`/api/pengajuan/${data.id}/pdf?download=1`, '_blank');
    }
  };

  const content = (
    <div className="flex flex-col items-center gap-6 w-full max-w-[780px] mx-auto">
      {/* Page 1: Formulir Pengajuan Izin */}
      <div className="bg-white text-black font-serif shadow-2xl rounded-sm w-full border border-slate-200 print:border-none print:shadow-none print:p-0 print:max-w-none flex flex-col justify-between min-h-[850px] sm:min-h-[960px] overflow-hidden">
        <div className="p-4 sm:p-6 sm:px-10 sm:pt-8 flex-1">
          {/* Top Header Banner */}
          <div className="flex justify-end mb-1">
            <img
              src="/assets/header.png"
              alt="Globallink Header"
              className="w-[260px] sm:w-[440px] h-auto object-contain"
            />
          </div>


      {/* Document Title */}
      <div className="text-center font-bold text-base sm:text-lg tracking-wide uppercase mt-2 mb-4 font-sans">
        FORMULIR PENGAJUAN IZIN
      </div>

      {/* Main Info Table */}
      <table className="w-full text-[11px] sm:text-[13px] font-sans border-collapse mb-2">
        <tbody>
          <tr>
            <td className="w-[110px] sm:w-[220px] font-bold py-1">NAMA</td>
            <td className="w-[14px] sm:w-[20px] font-bold text-center py-1">:</td>
            <td className="border-b border-black py-1 px-1 font-normal">{data.nama || ''}</td>
          </tr>
          <tr>
            <td className="font-bold py-1">ID KARYAWAN</td>
            <td className="font-bold text-center py-1">:</td>
            <td className="border-b border-black py-1 px-1 font-normal">{data.id_karyawan || ''}</td>
          </tr>
          <tr>
            <td className="font-bold py-1">JABATAN</td>
            <td className="font-bold text-center py-1">:</td>
            <td className="border-b border-black py-1 px-1 font-normal">{data.jabatan || ''}</td>
          </tr>
          <tr>
            <td className="py-0.5"></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="font-bold py-1 align-top">
              JENIS IZIN
              <div className="font-normal text-[11px] text-slate-800 mt-0.5">
                ( Diisi oleh Atasan Langsung )
              </div>
            </td>
            <td className="font-bold text-center py-1 align-top">:</td>
            <td className="py-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold">
                    {isSakit ? '✓' : ''}
                  </span>
                  <span>Izin Sakit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold">
                    {isUpah ? '✓' : ''}
                  </span>
                  <span>Izin tidak masuk kerja</span>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="font-bold py-1">ALASAN</td>
            <td className="font-bold text-center py-1">:</td>
            <td className="border-b border-black py-1 px-1 font-normal">{data.alasan || ''}</td>
          </tr>
          <tr>
            <td className="font-bold py-1">TANGGAL</td>
            <td className="font-bold text-center py-1">:</td>
            <td className="border-b border-black py-1 px-1 font-normal">
              {formatDateRange(data.tanggal_mulai, data.tanggal_selesai)}
            </td>
          </tr>
          <tr>
            <td className="font-bold py-1">MASUK KEMBALI TANGGAL</td>
            <td className="font-bold text-center py-1">:</td>
            <td className="border-b border-black py-1 px-1 font-normal">
              {formatDateIndo(data.masuk_kembali_tanggal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Guidelines Rules Table */}
      <LeaveGuidelinesTable />

      {/* Approval Section */}
      <div className="font-sans text-[11px] sm:text-[12px] my-2">
        <div className="font-bold mb-1">
          Persetujuan Atasan <span className="font-normal">( Diisi oleh Atasan Langsung )</span>
        </div>
        <div className="flex">
          <div className="w-[180px] sm:w-[220px]">Disetujui / Ditolak</div>
          <div className="w-[20px] text-center font-bold">:</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold">
                {isApproved ? '✓' : ''}
              </span>
              <span>Disetujui</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold">
                {isPostponed ? '✓' : ''}
              </span>
              <span>
                {isPostponed && data.ditangguhkan_mulai && data.ditangguhkan_selesai ? (
                  `Ditangguhkan menjadi tanggal ${formatDateIndo(data.ditangguhkan_mulai)} S.d ${formatDateIndo(data.ditangguhkan_selesai)}`
                ) : (
                  'Ditangguhkan menjadi tanggal ……….. S.d……………'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold">
                {isRejected ? '✓' : ''}
              </span>
              <span>Ditolak</span>
            </div>
            <div className="pt-1 flex items-center">
              <span className="w-16">Alasan :</span>
              <span className="flex-1 border-b border-black pl-2 pb-0.5 min-h-[18px]">
                {data.alasan_atasan || ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="font-sans text-[10px] sm:text-[11px] text-slate-800 my-2 leading-tight">
        <span className="font-bold">Note:</span> Apabila sakit formulir diisi setelah karyawan tersebut masuk kembali dengan melampirkan surat keterangan sakit dari dokter
      </div>

      {/* Signatures Area */}
      <div className="font-sans text-[11px] sm:text-[12px] mt-4 mb-2">
        <div className="text-right pr-8 mb-1">
          Makassar, {getSuratDateFormatted(data.tanggal_surat)}
        </div>
        <table className="w-full text-center">
          <tbody>
            <tr>
              <td className="w-1/2 align-top">
                <div>Diajukan Oleh,</div>
                <div className="h-[75px] flex items-center justify-center my-1">
                  {data.tanda_tangan_pemohon ? (
                    <img
                      src={data.tanda_tangan_pemohon}
                      alt="Ttd Pemohon"
                      className="max-h-[70px] max-w-[200px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="border-b border-black inline-block font-bold min-w-[160px] px-2">
                  ( {data.nama || '................................'} )
                </div>
              </td>
              <td className="w-1/2 align-top">
                <div>Disetujui Oleh,</div>
                <div className="h-[75px] flex items-center justify-center my-1">
                  {data.tanda_tangan_atasan ? (
                    <img
                      src={data.tanda_tangan_atasan}
                      alt="Ttd Atasan"
                      className="max-h-[70px] max-w-[200px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="border-b border-black inline-block font-bold min-w-[160px] px-2">
                  ( {data.nama_atasan || '................................'} )
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      {/* Bottom Footer Banner - edge-to-edge at the absolute bottom */}
      <div className="w-full m-0 p-0 leading-none">
        <img
          src="/assets/footer.png"
          alt="Globallink Footer"
          className="w-full h-auto block m-0 p-0"
        />
      </div>
    </div>

    {/* Page 2: Lampiran Surat Keterangan Dokter */}
    {data.surat_dokter_url && (
      <div className="bg-white text-black font-serif shadow-2xl rounded-sm w-full border border-slate-200 print:border-none print:shadow-none print:p-0 print:max-w-none flex flex-col justify-between min-h-[960px] overflow-hidden print:break-before-page">
        <div className="p-6 sm:px-10 sm:pt-8 flex-1">
          {/* Header Banner */}
          <div className="flex justify-end mb-1">
            <img
              src="/assets/header.png"
              alt="Globallink Header"
              className="w-[320px] sm:w-[440px] h-auto object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center font-bold text-base sm:text-lg tracking-wide uppercase mt-2 mb-4 font-sans">
            {isSakit ? 'LAMPIRAN: SURAT KETERANGAN DOKTER' : 'LAMPIRAN: SURAT KETERANGAN'}
          </div>

          {/* Metadata Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-md p-3 mb-4 text-[11px] sm:text-[12px] font-sans">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-28 font-bold py-0.5">Nama Karyawan</td>
                  <td className="w-4 font-bold text-center py-0.5">:</td>
                  <td className="py-0.5">{data.nama || '-'}</td>
                  <td className="w-28 font-bold py-0.5">ID Karyawan</td>
                  <td className="w-4 font-bold text-center py-0.5">:</td>
                  <td className="py-0.5">{data.id_karyawan || '-'}</td>
                </tr>
                <tr>
                  <td className="font-bold py-0.5">Tanggal Izin</td>
                  <td className="font-bold text-center py-0.5">:</td>
                  <td className="py-0.5">{formatDateRange(data.tanggal_mulai, data.tanggal_selesai)}</td>
                  <td className="font-bold py-0.5">Jabatan</td>
                  <td className="font-bold text-center py-0.5">:</td>
                  <td className="py-0.5">{data.jabatan || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Image Frame */}
          <div className="w-full h-[620px] border border-dashed border-slate-400 rounded-lg p-2 bg-slate-50/50 flex items-center justify-center overflow-hidden">
            <img
              src={data.surat_dokter_url}
              alt="Lampiran Surat Dokter"
              className="max-w-full max-h-[600px] object-contain rounded shadow-xs"
            />
          </div>
        </div>

        {/* Footer Banner */}
        <div className="w-full m-0 p-0 leading-none">
          <img
            src="/assets/footer.png"
            alt="Globallink Footer"
            className="w-full h-auto block m-0 p-0"
          />
        </div>
      </div>
    )}
  </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl my-auto bg-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Preview Surat Pengajuan Izin</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">PT Globallink Solution</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {data.id && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="px-2.5 sm:px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 sm:ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Modal Document Body */}
          <div className="p-2 sm:p-8 max-h-[85vh] overflow-y-auto overflow-x-auto bg-slate-200/80 flex justify-center">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}
