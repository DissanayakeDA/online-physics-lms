'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api, { getUploadsUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Video, Play, Upload, X, BookOpen, Save, Users, Link as LinkIcon, Calendar } from 'lucide-react';
import { useConfirmDialog } from '../ConfirmDialog';

interface ClassData {
  _id: string; title: string; subject: string; instructor: string; price: number;
  thumbnail: string; status: string; duration: string; level: string; enrolledCount: number;
  recordings: { _id: string; title: string; url: string; date: string; description: string }[];
  liveClasses: { _id: string; title: string; url: string; scheduledAt: string; description: string }[];
  description: string; tags: string[];
}
const INITIAL = { title: '', description: '', subject: '', instructor: '', price: 0, tags: '' };
const THUMB_COLORS = ['thumb-orange','thumb-purple','thumb-blue','thumb-teal','thumb-pink','thumb-green'];

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassData | null>(null);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<ClassData | null>(null);
  const [showMedia, setShowMedia] = useState(false);
  const [mediaTab, setMediaTab] = useState<'recordings'|'live'>('recordings');
  const [recForm, setRecForm] = useState({ title: '', url: '', description: '', date: '' });
  const [liveForm, setLiveForm] = useState({ title: '', url: '', description: '', scheduledAt: '' });
  const [addingRec, setAddingRec] = useState(false);
  const [addingLive, setAddingLive] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [thumbForClass, setThumbForClass] = useState<string | null>(null);
  const modalPosterInputRef = useRef<HTMLInputElement>(null);
  const [pendingPoster, setPendingPoster] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const { confirm: confirmDelete, DialogComponent } = useConfirmDialog();

  const revokePosterPreview = useCallback(() => {
    setPosterPreviewUrl(u => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
  }, []);

  useEffect(() => {
    api.get('/classes').then(({ data }) => setClasses(data)).catch(() => toast.error('Failed to load classes')).finally(() => setLoading(false));
  }, []);

  const imgUrl = (t: string) => getUploadsUrl(t);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL);
    setPendingPoster(null);
    revokePosterPreview();
    setShowModal(true);
  };
  const openEdit = (c: ClassData) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description, subject: c.subject, instructor: c.instructor,
      price: c.price, tags: c.tags?.join(', ') || '' });
    setPendingPoster(null);
    revokePosterPreview();
    setShowModal(true);
  };

  const uploadClassPoster = async (classId: string, file: File) => {
    const fd = new FormData();
    fd.append('thumbnail', file);
    const { data } = await api.post(`/classes/${classId}/thumbnail`, fd);
    return data as ClassData;
  };

  const handleSave = async () => {
    if (!form.title || !form.subject || !form.instructor) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        subject: form.subject,
        instructor: form.instructor,
        price: Number(form.price),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      };
      if (editing) {
        const { data } = await api.patch(`/classes/${editing._id}`, payload);
        let next = data as ClassData;
        if (pendingPoster) {
          try {
            next = await uploadClassPoster(editing._id, pendingPoster);
            toast.success('Class updated with new poster!');
          } catch {
            toast.error('Class saved, but poster upload failed');
          }
        } else {
          toast.success('Class updated!');
        }
        setClasses(prev => prev.map(c => c._id === editing._id ? next : c));
      } else {
        const { data } = await api.post('/classes', payload);
        let next = data as ClassData;
        if (pendingPoster) {
          try {
            next = await uploadClassPoster(data._id, pendingPoster);
            toast.success('Class created with poster!');
          } catch {
            toast.error('Class created, but poster upload failed');
            setClasses(prev => [data, ...prev]);
            setShowModal(false);
            setPendingPoster(null);
            revokePosterPreview();
            return;
          }
        } else {
          toast.success('Class created!');
        }
        setClasses(prev => [next, ...prev]);
      }
      setShowModal(false);
      setPendingPoster(null);
      revokePosterPreview();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete({ title: 'Delete Class', message: 'Are you sure you want to delete this class? This will remove all recordings, live classes, and associated data permanently.', confirmText: 'Delete Class', danger: true });
    if (!ok) return;
    try { await api.delete(`/classes/${id}`); setClasses(prev => prev.filter(c => c._id !== id)); toast.success('Class deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleThumb = async (clsId: string, file: File) => {
    try {
      const data = await uploadClassPoster(clsId, file);
      setClasses(prev => prev.map(c => c._id === clsId ? data : c));
      toast.success('Thumbnail uploaded!');
    } catch { toast.error('Failed to upload thumbnail'); }
  };

  const openMedia = (c: ClassData) => {
    setSelected(c); setShowMedia(true); setMediaTab('recordings');
    setRecForm({ title:'',url:'',description:'',date:'' });
    setLiveForm({ title:'',url:'',description:'',scheduledAt:'' });
  };

  const addRec = async () => {
    if (!recForm.title || !recForm.url) { toast.error('Fill title and URL'); return; }
    setAddingRec(true);
    try {
      const { data } = await api.post(`/classes/${selected!._id}/recordings`, recForm);
      setSelected(data); setClasses(prev => prev.map(c => c._id === data._id ? data : c));
      setRecForm({ title:'',url:'',description:'',date:'' }); toast.success('Recording added!');
    } catch { toast.error('Failed to add recording'); }
    finally { setAddingRec(false); }
  };

  const removeRec = async (rid: string) => {
    try {
      const { data } = await api.delete(`/classes/${selected!._id}/recordings/${rid}`);
      setSelected(data); setClasses(prev => prev.map(c => c._id === data._id ? data : c)); toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
  };

  const addLive = async () => {
    if (!liveForm.title || !liveForm.url) { toast.error('Fill title and URL'); return; }
    setAddingLive(true);
    try {
      const { data } = await api.post(`/classes/${selected!._id}/live-classes`, liveForm);
      setSelected(data); setClasses(prev => prev.map(c => c._id === data._id ? data : c));
      setLiveForm({ title:'',url:'',description:'',scheduledAt:'' }); toast.success('Live class added!');
    } catch { toast.error('Failed to add'); }
    finally { setAddingLive(false); }
  };

  const removeLive = async (lid: string) => {
    try {
      const { data } = await api.delete(`/classes/${selected!._id}/live-classes/${lid}`);
      setSelected(data); setClasses(prev => prev.map(c => c._id === data._id ? data : c)); toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Manage Classes</h2>
          <p className="text-sm text-3">{classes.length} classes total</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus className="w-4 h-4" />Add Class</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card overflow-hidden"><div className="shimmer h-36 w-full" /><div className="p-4 space-y-2"><div className="shimmer h-4 w-3/4 rounded" /></div></div>)}
        </div>
      ) : classes.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen className="w-16 h-16 text-3 mx-auto mb-4" />
          <p className="font-bold text-1 mb-2">No classes yet</p>
          <p className="text-3 text-sm mb-5">Create your first class to get started</p>
          <button onClick={openCreate} className="btn-primary gap-2"><Plus className="w-4 h-4" />Create Class</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => {
            const url = imgUrl(cls.thumbnail);
            const color = THUMB_COLORS[i % THUMB_COLORS.length];
            return (
              <div key={cls._id} className="card card-hover overflow-hidden group">
                <div className={`relative h-36 overflow-hidden ${!url ? color : ''}`}>
                  {url ? <img src={url} alt={cls.title} className="w-full h-full object-cover" />
                       : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-white/30" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => { setThumbForClass(cls._id); thumbRef.current?.click(); }}
                      className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 backdrop-blur transition-all" title="Upload thumbnail">
                      <Upload className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <input ref={thumbRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f && thumbForClass) { handleThumb(thumbForClass, f); e.target.value = ''; } }} />
                  <div className="absolute top-2 right-2">
                    <span className={`badge text-white ${cls.status === 'active' ? 'bg-success/80' : cls.status === 'upcoming' ? 'bg-warning/80' : 'bg-surface/80'}`}>
                      {cls.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-1 line-clamp-1 mb-0.5">{cls.title}</h3>
                  <p className="text-xs text-3 mb-3">{cls.subject} · {cls.instructor}</p>
                  <div className="flex items-center gap-3 text-xs text-3 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.enrolledCount}</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" />{cls.recordings.length}</span>
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{cls.liveClasses.length}</span>
                    <span className="font-bold gradient-text ml-auto">LKR {cls.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cls)} className="flex-1 btn-secondary py-2 text-xs gap-1"><Edit className="w-3.5 h-3.5" />Edit</button>
                    <button onClick={() => openMedia(cls)} className="flex-1 btn-secondary py-2 text-xs gap-1"><LinkIcon className="w-3.5 h-3.5" />Media</button>
                    <button onClick={() => handleDelete(cls._id)} className="card-sm px-3 py-2 text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-2xl p-7 animate-in max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {editing ? 'Edit Class' : 'Create New Class'}
              </h2>
              <button type="button" onClick={() => { setShowModal(false); setPendingPoster(null); revokePosterPreview(); }} className="text-3 hover:text-1 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-3 mb-1.5">Class Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input" placeholder="e.g. Advanced Mathematics" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-3 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="input min-h-[90px] resize-none" placeholder="Describe the class…" />
              </div>
              <div>
                <label className="block text-xs font-medium text-3 mb-1.5">Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="block text-xs font-medium text-3 mb-1.5">Instructor *</label>
                <input value={form.instructor} onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))} className="input" placeholder="Instructor name" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-3 mb-1.5">Price (LKR)</label>
                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="input" min="0" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-3 mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input" placeholder="math, science, grade-12" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-3 mb-1.5">Class poster (optional)</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-52 aspect-video rounded-xl border border-theme bg-surface-2 overflow-hidden flex items-center justify-center shrink-0">
                    {posterPreviewUrl ? (
                      <img src={posterPreviewUrl} alt="" className="w-full h-full object-cover" />
                    ) : editing && imgUrl(editing.thumbnail) ? (
                      <img src={imgUrl(editing.thumbnail)!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-10 h-10 text-3" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => modalPosterInputRef.current?.click()} className="btn-secondary text-sm py-2 gap-2">
                        <Upload className="w-4 h-4" />
                        {posterPreviewUrl || (editing?.thumbnail) ? 'Replace image' : 'Upload poster'}
                      </button>
                      {pendingPoster && (
                        <button type="button" onClick={() => { setPendingPoster(null); revokePosterPreview(); }} className="btn-secondary text-sm py-2">Clear new image</button>
                      )}
                    </div>
                    <input
                      ref={modalPosterInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (!f) return;
                        setPendingPoster(f);
                        setPosterPreviewUrl(prev => {
                          if (prev) URL.revokeObjectURL(prev);
                          return URL.createObjectURL(f);
                        });
                      }}
                    />
                    <p className="text-3 text-xs max-w-md">Used on class listings and detail pages. You can update it anytime from the class card.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => { setShowModal(false); setPendingPoster(null); revokePosterPreview(); }} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {showMedia && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-2xl p-7 animate-in max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Media Management</h2>
                <p className="text-sm text-3">{selected.title}</p>
              </div>
              <button onClick={() => setShowMedia(false)} className="text-3 hover:text-1 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex gap-1 bg-surface-2 rounded-xl p-1 mb-6">
              {([
                ['recordings', `Recordings (${selected.recordings.length})`, Video],
                ['live', `Live (${selected.liveClasses.length})`, Play],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setMediaTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${mediaTab === id ? 'gradient-primary text-white shadow-sm' : 'text-3 hover:text-1'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {mediaTab === 'recordings' && (
              <div>
                <div className="bg-surface-2 rounded-xl p-4 mb-5 border border-theme">
                  <h3 className="font-semibold text-1 text-sm mb-3">Add Recording</h3>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input value={recForm.title} onChange={e => setRecForm(p => ({ ...p, title: e.target.value }))} className="input text-sm" placeholder="Title *" />
                    <input value={recForm.url} onChange={e => setRecForm(p => ({ ...p, url: e.target.value }))} className="input text-sm" placeholder="Video URL *" />
                    <input value={recForm.description} onChange={e => setRecForm(p => ({ ...p, description: e.target.value }))} className="input text-sm" placeholder="Description" />
                    <input type="date" value={recForm.date} onChange={e => setRecForm(p => ({ ...p, date: e.target.value }))} className="input text-sm" />
                  </div>
                  <button onClick={addRec} disabled={addingRec} className="btn-primary text-sm py-2 gap-2">
                    {addingRec ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Add Recording</>}
                  </button>
                </div>
                <div className="space-y-2">
                  {selected.recordings.length === 0 ? <p className="text-3 text-sm text-center py-4">No recordings yet</p>
                    : selected.recordings.map((r, i) => (
                      <div key={r._id} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl border border-theme">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-1 text-sm truncate">{r.title}</p>
                          <p className="text-xs text-3 truncate">{r.url}</p>
                        </div>
                        <button onClick={() => removeRec(r._id)} className="text-danger hover:opacity-70 transition-opacity shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {mediaTab === 'live' && (
              <div>
                <div className="bg-surface-2 rounded-xl p-4 mb-5 border border-theme">
                  <h3 className="font-semibold text-1 text-sm mb-3">Add Live Class</h3>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input value={liveForm.title} onChange={e => setLiveForm(p => ({ ...p, title: e.target.value }))} className="input text-sm" placeholder="Title *" />
                    <input value={liveForm.url} onChange={e => setLiveForm(p => ({ ...p, url: e.target.value }))} className="input text-sm" placeholder="Zoom URL *" />
                    <input value={liveForm.description} onChange={e => setLiveForm(p => ({ ...p, description: e.target.value }))} className="input text-sm" placeholder="Description" />
                    <input type="datetime-local" value={liveForm.scheduledAt} onChange={e => setLiveForm(p => ({ ...p, scheduledAt: e.target.value }))} className="input text-sm" />
                  </div>
                  <button onClick={addLive} disabled={addingLive} className="btn-primary text-sm py-2 gap-2">
                    {addingLive ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Add Live Class</>}
                  </button>
                </div>
                <div className="space-y-2">
                  {selected.liveClasses.length === 0 ? <p className="text-3 text-sm text-center py-4">No live classes yet</p>
                    : selected.liveClasses.map(l => (
                      <div key={l._id} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl border border-theme">
                        <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                          <span className="w-2 h-2 rounded-full bg-red-500 block animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-1 text-sm truncate">{l.title}</p>
                          <p className="text-xs text-3 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{l.scheduledAt ? new Date(l.scheduledAt).toLocaleString() : 'No date'}
                          </p>
                        </div>
                        <button onClick={() => removeLive(l._id)} className="text-danger hover:opacity-70 transition-opacity shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {DialogComponent}
    </div>
  );
}
