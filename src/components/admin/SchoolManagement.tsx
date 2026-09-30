import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { School, ClassGrade } from '../../types';
import { 
  Building2, 
  Layers, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  GraduationCap, 
  Save 
} from 'lucide-react';

export const SchoolManagement: React.FC = () => {
  const { state, store } = useCbt();
  const [school, setSchool] = useState<School>(state.school);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<7 | 8 | 9>(7);

  const handleUpdateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSchool(school);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: ClassGrade = {
      id: `cls-${Date.now().toString(36)}`,
      school_id: school.id,
      name: newClassName.trim().toUpperCase(),
      grade_level: newClassGrade,
      total_students: 0,
      created_at: new Date().toISOString(),
    };

    store.addClass(newClass);
    setNewClassName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Profil Sekolah & Rombongan Belajar (Kelas)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Identitas satuan pendidikan pelaksana asesmen TKA SMP dan pemetaan kelas peserta didik.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: School Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Identitas Satuan Pendidikan
            </span>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Berhasil Disimpan!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateSchool} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">NPSN Sekolah</label>
                <input
                  type="text"
                  required
                  value={school.npsn}
                  onChange={(e) => setSchool({ ...school, npsn: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  required
                  value={school.name}
                  onChange={(e) => setSchool({ ...school, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                value={school.address}
                onChange={(e) => setSchool({ ...school, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kecamatan</label>
                <input
                  type="text"
                  required
                  value={school.subdistrict}
                  onChange={(e) => setSchool({ ...school, subdistrict: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  required
                  value={school.city}
                  onChange={(e) => setSchool({ ...school, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Provinsi</label>
                <input
                  type="text"
                  required
                  value={school.province}
                  onChange={(e) => setSchool({ ...school, province: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                required
                value={school.principal_name}
                onChange={(e) => setSchool({ ...school, principal_name: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Sekolah</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Classes Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Daftar Kelas ({state.classes.length})</span>
            </span>
          </div>

          {/* Add class form */}
          <form onSubmit={handleAddClass} className="space-y-2 text-xs">
            <div className="flex gap-2">
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(Number(e.target.value) as 7 | 8 | 9)}
                className="px-2.5 py-2 border rounded-lg bg-white"
              >
                <option value={7}>Kelas 7</option>
                <option value={8}>Kelas 8</option>
                <option value={9}>Kelas 9</option>
              </select>
              <input
                type="text"
                placeholder="Nama (misal: IX B)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg font-bold uppercase"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
              >
                Tambah
              </button>
            </div>
          </form>

          {/* Class list */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {state.classes.map((cls) => {
              const studentCount = state.students.filter((s) => s.class_id === cls.id).length;

              return (
                <div 
                  key={cls.id} 
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">Kelas {cls.name}</span>
                    <div className="text-[10px] text-slate-400">Jenjang Tingkat {cls.grade_level} SMP</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold font-mono text-[11px]">
                    {studentCount} Siswa
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
