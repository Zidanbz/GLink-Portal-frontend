'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Briefcase,
  CalendarDays,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';

export default function MenuAwalPage() {
  const [modalFeature, setModalFeature] = useState<{ title: string; desc: string; type: string } | null>(null);

  const menuItems = [
    {
      id: 'izin',
      title: 'Pengajuan Izin',
      subtitle: 'Izin Sakit & Tidak Masuk Kerja',
      desc: 'Formulir izin sakit (dengan lampiran surat dokter) atau izin tidak masuk kerja dengan output dokumen PDF resmi.',
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200',
      badge: 'Aktif & Siap Digunakan',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      href: '/izin',
      available: true,
      buttonText: 'Buka Formulir Izin'
    },
    {
      id: 'dinas',
      title: 'Pengajuan Dinas',
      subtitle: 'Perjalanan Dinas & Surat Tugas',
      desc: 'Permohonan surat tugas operasional, lampiran agenda kegiatan perjalanan, dan estimasi anggaran operasional dinas.',
      icon: Briefcase,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200',
      badge: 'Aktif & Siap Digunakan',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      href: '/dinas',
      available: true,
      buttonText: 'Buka Formulir Dinas'
    },
    {
      id: 'cuti',
      title: 'Pengajuan Cuti',
      subtitle: 'Cuti Tahunan & Cuti Khusus',
      desc: 'Pengajuan hak cuti tahunan, cuti melahirkan, atau cuti lainnya beserta lampiran serah terima amanah tanggung jawab.',
      icon: CalendarDays,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border-teal-200',
      badge: 'Aktif & Siap Digunakan',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      href: '/cuti',
      available: true,
      buttonText: 'Buka Formulir Cuti'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
                  Portal Pengajuan Karyawan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Portal Resmi</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Pengajuan Mandiri
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Pilih Menu Pengajuan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Silakan pilih salah satu layanan pengajuan di bawah ini untuk mengisi formulir dan membuat dokumen resmi berstandar PT Globallink Smart IT Solution.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 3 Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map(item => {
            const Icon = item.icon;

            const cardInner = (
              <div
                className={`h-full bg-white rounded-2xl border transition-all p-5 sm:p-6 flex flex-col justify-between shadow-xs ${
                  item.available
                    ? 'border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 group cursor-pointer'
                    : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
                }`}
                onClick={() => {
                  if (!item.available) {
                    setModalFeature({
                      title: item.title,
                      desc: item.desc,
                      type: item.id
                    });
                  }
                }}
              >
                <div>
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.iconBg}`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-2.5">
                    {item.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                {/* Card Button */}
                <div className="pt-2 border-t border-slate-100">
                  {item.available ? (
                    <div className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow-md">
                      <span>{item.buttonText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>{item.buttonText}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            );

            if (item.available && item.href) {
              return (
                <Link key={item.id} href={item.href} className="block h-full">
                  {cardInner}
                </Link>
              );
            }

            return (
              <div key={item.id} className="block h-full">
                {cardInner}
              </div>
            );
          })}
        </div>

        {/* Info Petunjuk Singkat */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3.5">
            <Info className="w-4 h-4 text-blue-600" />
            Alur Pengajuan Dokumen
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">1. Lengkapi Data</span>
              Pilih menu pengajuan yang diperlukan lalu isi identitas, alasan, dan periode tanggal izin.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">2. Tanda Tangan Digital</span>
              Goreskan tanda tangan langsung melalui kanvas touchscreen ponsel atau mouse desktop.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">3. Generate & Unduh PDF</span>
              Klik Generate PDF untuk langsung mengunduh surat izin resmi ke perangkat Anda.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4">
          © 2026 PT Globallink Smart IT Solution. All rights reserved.
        </div>
      </footer>

      {/* Modal Segera Hadir */}
      {modalFeature && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setModalFeature(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Segera Hadir
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                {modalFeature.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Formulir <strong>{modalFeature.title}</strong> saat ini sedang dalam proses integrasi template dokumen resmi dan akan segera diaktifkan.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setModalFeature(null)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
