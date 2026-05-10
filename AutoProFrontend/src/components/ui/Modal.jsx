import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Reusable Modal component
 * Usage: <Modal title="Add Staff" onClose={() => setOpen(false)}> ... </Modal>
 */
export default function Modal({ title, onClose, children, maxWidth = 'max-w-md', icon: Icon }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      {/* Panel */}
      <div
        className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full ${maxWidth} z-10 max-h-[90vh] overflow-y-auto`}
        style={{ animation: 'fadeScale 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={16} className="text-primary" />
              </div>
            )}
            <h3 className="text-base font-display font-black text-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
