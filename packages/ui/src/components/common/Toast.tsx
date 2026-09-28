import React from 'react';
import { useTenant } from '../../context/TenantContext';

export const Toast: React.FC = () => {
  const { toast } = useTenant();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface shadow-2xl transition-all duration-300 animate-bounce-short pointer-events-auto border border-outline/20 max-w-[90vw]"
    >
      <span className="material-symbols-outlined text-[20px] text-primary-fixed">
        {toast.icon || 'check_circle'}
      </span>
      <span className="font-label-md text-label-md text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
        {toast.message}
      </span>
    </div>
  );
};
