'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Users, UserCheck, UserX, Trash2, Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useConfirmDialog } from '../ConfirmDialog';

interface Student {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { confirm: confirmDelete, DialogComponent } = useConfirmDialog();

  useEffect(() => {
    api.get('/users')
      .then(({ data }) => setStudents(data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (id: string) => {
    try {
      const { data } = await api.patch(`/users/${id}/toggle-active`);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: data.isActive } : s));
      toast.success(`Account ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update account'); }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete({ title: 'Delete Student', message: 'Are you sure you want to delete this student account? This action cannot be undone.', confirmText: 'Delete Student', danger: true });
    if (!ok) return;
    try {
      await api.delete(`/users/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      toast.success('Student deleted');
    } catch { toast.error('Failed to delete student'); }
  };

  const active = students.filter(s => s.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-1">Manage Students</h2>
          <p className="text-sm text-3">{students.length} total · {active} active</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 w-64"
            placeholder="Search students..."
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: students.length, cls: 'gradient-primary', icon: '👥' },
          { label: 'Active', value: active, cls: 'bg-success/15', textCls: 'text-success', icon: '✅' },
          { label: 'Inactive', value: students.length - active, cls: 'bg-danger/15', textCls: 'text-danger', icon: '⛔' },
        ].map(({ label, value, cls, textCls, icon }) => (
          <div key={label} className={`card-sm p-4 text-center ${cls}`}>
            <p className={`text-2xl font-black ${textCls || 'text-white'}`}>{value}</p>
            <p className="text-xs text-3 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-4">
                <div className="shimmer w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-1/3 rounded-lg" />
                  <div className="shimmer h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Users className="w-16 h-16 text-3 mx-auto mb-4" />
          <p className="font-bold text-1 mb-1">{search ? 'No students found' : 'No students yet'}</p>
          <p className="text-3 text-sm">{search ? 'Try a different search term' : 'Students will appear here after they register'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(student => (
            <div
              key={student._id}
              className="card card-hover p-4 border border-theme hover:border-[var(--primary)] transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${student.isActive ? 'gradient-primary' : 'bg-surface-2'}`}>
                    <span className={student.isActive ? 'text-white' : 'text-3'}>
                      {student.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-1 truncate">{student.fullName}</p>
                      <span className={`badge hidden sm:inline-flex ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-xs text-3 flex items-center gap-1">
                        <Mail className="w-3 h-3" />{student.email}
                      </span>
                      {student.phone && (
                        <span className="text-xs text-3 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{student.phone}
                        </span>
                      )}
                      {student.address && (
                        <span className="text-xs text-3 flex items-center gap-1 hidden md:flex">
                          <MapPin className="w-3 h-3" />{student.address}
                        </span>
                      )}
                      <span className="text-xs text-3 flex items-center gap-1 hidden md:flex">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(student.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(student._id)}
                    title={student.isActive ? 'Deactivate account' : 'Activate account'}
                    className={`p-2 rounded-xl border transition-all ${
                      student.isActive
                        ? 'border-warning/20 text-warning hover:bg-warning/10'
                        : 'border-success/20 text-success hover:bg-success/10'
                    }`}
                  >
                    {student.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(student._id)}
                    className="p-2 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {DialogComponent}
    </div>
  );
}
