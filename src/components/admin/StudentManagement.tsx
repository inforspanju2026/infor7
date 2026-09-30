import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { Student } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  Printer, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  KeyRound, 
  Eye, 
  GraduationCap,
  FileSpreadsheet
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { state, store } = useCbt();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [cardModalStudent, setCardModalStudent] = useState<Student | null>(null);
  const [printAllCards, setPrintAllCards] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPartNo, setFormPartNo] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formClassId, setFormClassId] = useState(state.classes[0]?.id || '');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formPin, setFormPin] = useState('123456');
  const [formAccessibility, setFormAccessibility] = useState(false);
  const [formAccessNotes, setFormAccessNotes] = useState('');

  // Import State
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ valid: number; errors: string[] } | null>(null);

  // Filter students
  const filteredStudents = state.students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.participant_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.nisn.includes(searchTerm);
    const matchClass = selectedClass === 'all' || s.class_id === selectedClass;
    return matchSearch && matchClass;
  });

  const openAddModal = () => {
    setEditStudent(null);
    setFormName('');
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormPartNo(`04-001-${randomNum}-8`);
    setFormNisn(`009${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormNis(`2324${Math.floor(1000 + Math.random() * 9000)}`);
    setFormClassId(state.classes[0]?.id || '');
    setFormGender('L');
    setFormPin('123456');
    setFormAccessibility(false);
    setFormAccessNotes('');
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditStudent(s);
    setFormName(s.full_name);
    setFormPartNo(s.participant_number);
    setFormNisn(s.nisn);
    setFormNis(s.nis);
    setFormClassId(s.class_id);
    setFormGender(s.gender);
    setFormPin(s.pin);
    setFormAccessibility(s.needs_accessibility);
    setFormAccessNotes(s.accessibility_notes || '');
    setModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editStudent) {
      store.updateStudent({
        ...editStudent,
        full_name: formName,
        participant_number: formPartNo,
        nisn: formNisn,
        nis: formNis,
        class_id: formClassId,
        gender: formGender,
        pin: formPin,
        needs_accessibility: formAccessibility,
        accessibility_notes: formAccessNotes,
      });
    } else {
      const newStudent: Student = {
        id: `std-${Date.now().toString(36)}`,
        school_id: state.school.id,
        class_id: formClassId,
        participant_number: formPartNo,
        nisn: formNisn,
        nis: formNis,
        full_name: formName,
        gender: formGender,
        birth_place: 'Bandung',
        birth_date: '2011-05-15',
        username: `std.${formName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}`,
        password_hash: formPin,
        pin: formPin,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        is_active: true,
        needs_accessibility: formAccessibility,
        accessibility_notes: formAccessNotes,
        created_at: new Date().toISOString(),
      };
      store.addStudent(newStudent);
    }
    setModalOpen(false);
  };

  // Excel / CSV Importer
  const handleProcessImport = () => {
    const lines = importText.trim().split('\n');
    if (lines.length === 0) return;

    const newStudents: Student[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      // Expecting CSV format: nomor_peserta,nisn,nama_lengkap,jenis_kelamin,nama_kelas,pin
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 3) {
        errors.push(`Baris ${index + 1}: Format tidak lengkap (minimal nomor peserta, NISN, nama)`);
        return;
      }

      const [partNo, nisn, name, gender, className, pin] = parts;
      const matchedClass = state.classes.find((c) => c.name.toLowerCase() === (className || '').toLowerCase()) || state.classes[0];

      newStudents.push({
        id: `std-imp-${Date.now().toString(36)}-${index}`,
        school_id: state.school.id,
        class_id: matchedClass.id,
        participant_number: partNo,
        nisn: nisn,
        nis: `2324${1000 + index}`,
        full_name: name,
        gender: (gender?.toUpperCase() === 'P' ? 'P' : 'L'),
        birth_place: 'Kota',
        birth_date: '2011-01-01',
        username: `std.${name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}`,
        password_hash: pin || '123456',
        pin: pin || '123456',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        is_active: true,
        needs_accessibility: false,
        created_at: new Date().toISOString(),
      });
    });

    setImportResult({ valid: newStudents.length, errors });

    if (newStudents.length > 0) {
      store.importStudents(newStudents);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Nomor Peserta,NISN,NIS,Nama Lengkap,Jenis Kelamin,Kelas,Username,PIN,Aksesibilitas'];
    const rows = state.students.map((s) => {
      const cls = state.classes.find((c) => c.id === s.class_id)?.name || '';
      return `"${s.participant_number}","${s.nisn}","${s.nis}","${s.full_name}","${s.gender}","${cls}","${s.username}","${s.pin}","${s.needs_accessibility ? 'Ya' : 'Tidak'}"`;
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daftar_peserta_cbt_smpn7_pasuruan_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Manajemen Data Peserta & Kartu Ujian</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data siswa, generate akun & PIN, cetak kartu peserta digital, dan import/export Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCardModalStudent(state.students[0]);
              setPrintAllCards(true);
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Semua Kartu</span>
          </button>
          <button
            onClick={() => {
              setImportText(
                '04-001-031-2,0091234581,Kirana Salsabila,P,IX A,123456\n04-001-032-1,0091234582,Leo Anggoro Pratama,L,IX A,123456'
              );
              setImportResult(null);
              setImportModalOpen(true);
            }}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel/CSV</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Peserta</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, nomor peserta, NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kelas ({state.students.length} Siswa)</option>
            {state.classes.map((c) => (
              <option key={c.id} value={c.id}>
                Kelas {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">No Peserta</th>
                <th className="p-3.5">NISN / NIS</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">PIN / Password</th>
                <th className="p-3.5">Aksesibilitas</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data peserta yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const cls = state.classes.find((c) => c.id === s.class_id)?.name || '-';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 text-center font-mono font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{s.full_name}</div>
                        <div className="text-[11px] text-slate-400">JK: {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-blue-700">
                        {s.participant_number}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        <div>NISN: {s.nisn}</div>
                        <div className="text-[10px] text-slate-400">NIS: {s.nis}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {cls}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border text-slate-700 font-bold">
                          {s.pin}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {s.needs_accessibility ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium" title={s.accessibility_notes}>
                            +15 Menit Khusus
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standar</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Cetak Kartu */}
                          <button
                            onClick={() => {
                              setCardModalStudent(s);
                              setPrintAllCards(false);
                            }}
                            title="Cetak Kartu Peserta Ujian Digital"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(s)}
                            title="Edit Data Peserta"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data peserta ${s.full_name}?`)) {
                                store.deleteStudent(s.id);
                              }
                            }}
                            title="Hapus Peserta"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Peserta */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">
                {editStudent ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nomor Peserta</label>
                  <input
                    type="text"
                    required
                    value={formPartNo}
                    onChange={(e) => setFormPartNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {state.classes.map((c) => (
                      <option key={c.id} value={c.id}>Kelas {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">NIS</label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">PIN / Password</label>
                  <input
                    type="text"
                    required
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Jenis Kelamin</label>
                <div className="flex space-x-4 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formGender === 'L'}
                      onChange={() => setFormGender('L')}
                    />
                    <span>Laki-laki (L)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formGender === 'P'}
                      onChange={() => setFormGender('P')}
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAccessibility}
                    onChange={(e) => setFormAccessibility(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800">Siswa dengan Kebutuhan Aksesibilitas Khusus</span>
                </label>
                {formAccessibility && (
                  <input
                    type="text"
                    placeholder="Catatan: misal butuh waktu +15 menit atau font besar..."
                    value={formAccessNotes}
                    onChange={(e) => setFormAccessNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import Excel / CSV */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Import Peserta dari Excel / CSV</h3>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Salin data peserta dari Excel dalam format kolom CSV berikut:
              <br />
              <strong className="font-mono text-slate-700">nomor_peserta, nisn, nama_lengkap, jenis_kelamin(L/P), nama_kelas, pin</strong>
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="04-001-031-2,0091234581,Kirana Salsabila,P,IX A,123456"
              className="w-full p-3 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
            />

            {importResult && (
              <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Berhasil memproses {importResult.valid} data siswa!</span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-red-600 text-[11px] pt-1">
                    {importResult.errors.map((err, i) => (
                      <div key={i}>&bull; {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">*Validasi otomatis sebelum dimasukkan ke database</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Eksekusi Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cetak Kartu Peserta Ujian Digital */}
      {cardModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-slate-900">
            {/* Top Toolbar (no print) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm">
                  {printAllCards ? `Cetak Semua Kartu Peserta (${filteredStudents.length} Siswa)` : 'Pratinjau Kartu Peserta Ujian'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => {
                    setCardModalStudent(null);
                    setPrintAllCards(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Cards Container */}
            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              {(printAllCards ? filteredStudents : [cardModalStudent]).map((student, idx) => {
                const cls = state.classes.find((c) => c.id === student.class_id)?.name || 'IX A';

                return (
                  <div 
                    key={student.id} 
                    className="p-6 border-2 border-slate-900 rounded-xl bg-white shadow-sm space-y-4 page-break"
                  >
                    {/* Header Kartu */}
                    <div className="border-b-2 border-slate-900 pb-3 flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-600">
                          KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                        </div>
                        <h4 className="text-base font-black tracking-tight uppercase text-slate-900">
                          {state.school.name}
                        </h4>
                        <div className="text-[10px] text-slate-500">
                          {state.school.address}, {state.school.city} &bull; NPSN: {state.school.npsn}
                        </div>
                      </div>
                    </div>

                    <div className="text-center font-extrabold text-sm tracking-wide uppercase bg-slate-100 py-1 rounded border border-slate-300">
                      KARTU PESERTA ASESMEN SMPN 7 PASURUAN TAHUN 2026/2027
                    </div>

                    {/* Data Peserta */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      {/* Photo Placeholder */}
                      <div className="col-span-1 flex flex-col items-center justify-center border border-slate-300 rounded-lg p-2 bg-slate-50">
                        <img 
                          src={student.photo_url} 
                          alt="Foto" 
                          className="w-24 h-32 object-cover rounded border border-slate-300"
                        />
                        <span className="text-[10px] font-mono mt-1 text-slate-500">Foto Resmi</span>
                      </div>

                      {/* Info Fields */}
                      <div className="col-span-2 space-y-1.5">
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">Nomor Peserta</span>
                          <span className="font-mono font-bold text-slate-900">: {student.participant_number}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">NISN / NIS</span>
                          <span className="font-mono text-slate-800">: {student.nisn} / {student.nis}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">Nama Lengkap</span>
                          <span className="font-bold text-slate-900">: {student.full_name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">Kelas</span>
                          <span className="font-semibold text-slate-800">: {cls}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">Username Login</span>
                          <span className="font-mono font-bold text-blue-700">: {student.participant_number}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">Password / PIN</span>
                          <span className="font-mono font-black text-slate-900">: {student.pin}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 text-slate-500 font-semibold">Ruang & Sesi</span>
                          <span className="text-slate-800">: Lab Komputer 1 / Sesi 1</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Kartu & Tanda Tangan */}
                    <div className="border-t border-slate-300 pt-3 flex justify-between items-end text-[11px] text-slate-600">
                      <div>
                        <div className="font-bold">Ketentuan:</div>
                        <div className="text-[10px]">1. Kartu ini wajib dibawa saat pelaksanaan ujian.</div>
                        <div className="text-[10px]">2. Jagalah kerahasiaan PIN dan akun Anda.</div>
                      </div>

                      <div className="text-center">
                        <div>{state.school.city}, September 2026</div>
                        <div className="font-bold text-slate-800">Kepala Sekolah,</div>
                        <div className="h-12"></div>
                        <div className="font-bold underline text-slate-900">{state.school.principal_name}</div>
                        <div className="text-[10px] text-slate-500">NIP. 197205121998031004</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
