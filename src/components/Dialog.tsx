import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n';
export default function Dialog({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal(); document.body.style.overflow = 'hidden';
    return () => { ref.current?.close(); document.body.style.overflow = ''; if (previous?.isConnected) previous.focus(); else document.getElementById('map-selector')?.focus(); };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-label={title} onCancel={e => { e.preventDefault(); closeRef.current(); }} onClick={e => { if (e.target === e.currentTarget) closeRef.current(); }}><div className="dialog-inner"><button className="dialog-close icon-button" autoFocus onClick={onClose} aria-label={t('Chiudi finestra')}><X size={20} /></button>{children}</div></dialog>;
}
