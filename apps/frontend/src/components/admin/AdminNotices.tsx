'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Bell, Plus, Trash2, Edit, X, Save, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useConfirmDialog } from '../ConfirmDialog';

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  classId: { _id: string; title: string };
}

interface ClassItem {
  _id: string;
  title: string;
}

const TYPE_CONFIG: Record<string, { label: string; badgeCls: string; barCls: string; iconCls: string; bgCls: string; icon: any }> = {
  info:    { label: 'Info',    badgeCls: 'badge-info',    barCls: 'bg-info',    iconCls: 'text-info',    bgCls: 'bg-info/10',    icon: AlertCircle },
  warning: { label: 'Warning', badgeCls: 'badge-warning', barCls: 'bg-warning', iconCls: 'text-warning', bgCls: 'bg-warning/10', icon: AlertTriangle },
  success: { label: 'Success', badgeCls: 'badge-success', barCls: 'bg-success', iconCls: 'text-success', bgCls: 'bg-success/10', icon: CheckCircle },
  urgent:  { label: 'Urgent',  badgeCls: 'badge-danger',  barCls: 'bg-danger',  iconCls: 'text-danger',  bgCls: 'bg-danger/10',  icon: XCircle },
};

const INITIAL_FORM = { classId: '', title: '', content: '', type: 'info' };

export default function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [classFilter, setClassFilter] = useState('all');
  const { confirm: confirmDelete, DialogComponent } = useConfirmDialog();

  useEffect(() => {
    Promise.all([api.get('/notices'), api.get('/classes')])
      .then(([noticeRes, clsRes]) => { setNotices(noticeRes.data); setClasses(clsRes.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditingNotice(null); setForm(INITIAL_FORM); setShowModal(true); };
  const openEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setForm({ classId: notice.classId._id, title: notice.title, content: notice.content, type: notice.type });
    setShowModal(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!form.classId || !form.title || !form.content) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    try {
      if (editingNotice) {
        const { data } = await api.patch(`/notices/${editingNotice._id}`, form);
        setNotices(prev => prev.map(n => n._id === editingNotice._id ? { ...n, ...data } : n));
        toast.success('Notice updated!');
      } else {
        await api.post('/notices', form);
        const all = await api.get('/notices');
        setNotices(all.data);
        toast.success('Notice created!');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save notice');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete({ title: 'Delete Notice', message: 'Are you sure you want to delete this notice? This action cannot be undone.', confirmText: 'Delete Notice', danger: true });
    if (!ok) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
      toast.success('Notice deleted');
    } catch { toast.error('Failed to delete notice'); }
  };

  const filtered = classFilter === 'all' ? notices : notices.filter(n => n.classId?._id === classFilter);

  return (
    <>
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-1">Manage Notices</h2>
          <p className="text-sm text-3">{notices.length} notices total</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />Add Notice
        </button>
      </div>

      {/* Class filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setClassFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            classFilter === 'all'
              ? 'gradient-primary text-white border-transparent shadow-md'
              : 'bg-surface-2 text-3 hover:text-1 border-theme'
          }`}
        >
          All Classes
        </button>
        {classes.map(cls => (
          <button
            key={cls._id}
            onClick={() => setClassFilter(cls._id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border truncate max-w-[160px] ${
              classFilter === cls._id
                ? 'gradient-primary text-white border-transparent shadow-md'
                : 'bg-surface-2 text-3 hover:text-1 border-theme'
            }`}
          >
            {cls.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-24 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-16 h-16 text-3 mx-auto mb-4" />
          <p className="font-bold text-1 mb-2">No notices yet</p>
          <p className="text-3 text-sm mb-5">Create announcements for specific classes</p>
          <button onClick={openCreate} className="btn-primary gap-2"><Plus className="w-4 h-4" />Create Notice</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notice => {
            const cfg = TYPE_CONFIG[notice.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={notice._id} className="card card-hover overflow-hidden">
                {/* Colour bar */}
                <div className={`h-1 w-full ${cfg.barCls}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon bubble */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgCls}`}>
                        <Icon className={`w-4 h-4 ${cfg.iconCls}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-1 truncate">{notice.title}</h3>
                          <span className={`badge ${cfg.badgeCls}`}>{cfg.label}</span>
                        </div>
                        <p className="text-sm text-2 line-clamp-2">{notice.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-3">
                          <span className="text-primary-c font-medium">{notice.classId?.title}</span>
                          <span>·</span>
                          <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(notice)}
                        className="p-2 rounded-xl border border-theme text-3 hover:text-1 hover:border-[var(--primary)] transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice._id)}
                        className="p-2 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-7 animate-in shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-1">{editingNotice ? 'Edit Notice' : 'Create Notice'}</h2>
              <button onClick={() => setShowModal(false)} className="text-3 hover:text-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Class selector */}
              <div>
                <label className="block text-xs font-medium text-3 mb-1.5">Class *</label>
                <select
                  value={form.classId}
                  onChange={e => setForm(p => ({ ...p, classId: e.target.value }))}
                  className="input"
                >
                  <option value="">Select a class…</option>
                  {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.title}</option>)}
                </select>
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-xs font-medium text-3 mb-1.5">Notice Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                    const Icon = cfg.icon;
                    const active = form.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, type }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                          active
                            ? `${cfg.bgCls} ${cfg.iconCls} border-current`
                            : 'bg-surface-2 text-3 border-theme hover:text-1'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-3 mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="input"
                  placeholder="Notice title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-medium text-3 mb-1.5">Content *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  className="input min-h-[100px] resize-none"
                  placeholder="Notice content…"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 gap-2">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Save className="w-4 h-4" />Save</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {DialogComponent}
    </>
  );
}
