import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Copy } from 'lucide-react';
import { useLanguage } from '../i18n';
import { decodeTransferCode, encodeTransferCode, MAX_TRANSFER_INPUT_LENGTH } from '../transfer';
import type { Language } from '../translations';
import Dialog from './Dialog';

interface TransferDialogProps {
  completed: ReadonlySet<string>;
  onImport: (ids: Set<string>, language: Language) => void;
  onClose: () => void;
}

export default function TransferDialog({ completed, onImport, onClose }: TransferDialogProps) {
  const { language, t } = useLanguage();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const output = useRef<HTMLTextAreaElement>(null);
  const code = useMemo(() => encodeTransferCode(completed, language), [completed, language]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyNotice('Codice copiato.');
    } catch {
      output.current?.focus();
      output.current?.select();
      setCopyNotice('Seleziona e copia il codice manualmente.');
    }
  }

  function importCode(event: FormEvent) {
    event.preventDefault();
    let decoded: ReturnType<typeof decodeTransferCode>;
    try {
      decoded = decodeTransferCode(input);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Codice non valido o danneggiato.');
      return;
    }
    onImport(decoded.ids, decoded.language);
  }

  return <Dialog title={t('Trasferisci con codice')} className="transfer-dialog" onClose={onClose}>
    <h1>{t('Trasferisci con codice')}</h1>
    <p>{t('Importare un codice unisce i completamenti e applica la lingua ricevuta.')}</p>
    <label htmlFor="transfer-output">{t('Il tuo codice')}</label>
    <textarea id="transfer-output" ref={output} readOnly value={code} rows={3} spellCheck={false} onFocus={e => e.currentTarget.select()} />
    <button className="tutorial-button" onClick={() => void copy()}><Copy size={16} />{t('Copia codice')}</button>
    {copyNotice && <p role="status">{t(copyNotice)}</p>}
    <form onSubmit={importCode}>
      <label htmlFor="transfer-input">{t('Incolla un codice')}</label>
      <textarea id="transfer-input" value={input} onChange={e => { setInput(e.target.value); setError(''); }} maxLength={MAX_TRANSFER_INPUT_LENGTH} rows={3} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-invalid={!!error} aria-describedby={error ? 'transfer-error' : undefined} />
      {error && <p id="transfer-error" role="alert">{t(error)}</p>}
      <button className="primary-button" type="submit" disabled={!input.trim()}>{t('Importa codice')}</button>
    </form>
  </Dialog>;
}
