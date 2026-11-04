interface LeaveGuidelinesTableProps {
  id?: string;
}

export default function LeaveGuidelinesTable({ id }: LeaveGuidelinesTableProps) {
  return (
      <table id={id} aria-label="Ketentuan alasan dan durasi izin" className="w-full text-[11px] sm:text-[12px] font-sans border-collapse border border-black my-2.5">
        <thead>
          <tr className="bg-slate-50">
            <th scope="col" className="border border-black py-1 px-2 text-center font-bold w-[70%]">Alasan</th>
            <th scope="col" className="border border-black py-1 px-2 text-center font-bold w-[30%]">Izin</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border border-black py-0.5 px-2">a. Pernikahan Karyawan</td><td className="border border-black py-0.5 px-2 text-center">3 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">b. Pernikahan anak Karyawan</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">c. Khitanan/aqiqah/membaptis anak Karyawan</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">d. Istri Karyawan Melahirkan</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">e. Istri/Suami/anak Karyawan meninggal dunia</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">f. Orang tua/mertua Karyawan meninggal dunia</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">g. Saudara kandung meninggal dunia</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">h. Kakek/nenek/cucu/menantu/ipar/orang serumah Karyawan meninggal dunia</td><td className="border border-black py-0.5 px-2 text-center">2 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">i. Ibadah Umroh</td><td className="border border-black py-0.5 px-2 text-center">12 Hari</td></tr>
          <tr><td className="border border-black py-0.5 px-2">j. Kejadian Force Majeure</td><td className="border border-black py-0.5 px-2 text-center">Disesuaikan</td></tr>
        </tbody>
      </table>
  );
}
