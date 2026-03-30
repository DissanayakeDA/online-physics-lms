'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmText = 'Delete', cancelText = 'Cancel',
  danger = true, loading = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-6 animate-in shadow-lg">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1" disabled={loading}>
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 text-white px-4 py-2.5 ${
              danger ? 'bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/25' : 'bg-amber-500 hover:bg-amber-600'
            } disabled:opacity-60`}>
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : confirmText
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy usage
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean; title: string; message: string;
    confirmText?: string; danger?: boolean;
    resolve?: (v: boolean) => void;
  }>({ open: false, title: '', message: '' });

  const confirm = useCallback((opts: { title: string; message: string; confirmText?: string; danger?: boolean }) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, open: true, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState(s => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState(s => ({ ...s, open: false }));
  };

  const DialogComponent = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      danger={state.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, DialogComponent };
}
