import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const API = 'http://localhost:8000/api/notifications'

const EVENT_COLORS = {
  email: '#378ADD',
  sms: '#1D9E75',
  push: '#7F77DD',
  webhook: '#D85A30',
}

const STATUS_META = {
  sent: { bg: '#E1F5EE', color: '#0F6E56', label: 'Enviado' },
  failed: { bg: '#FCEBEB', color: '#A32D2D', label: 'Falha' },
  pending: { bg: '#FAEEDA', color: '#854F0B', label: 'Pendente' },
}

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'sent', label: 'Enviados' },
  { key: 'failed', label: 'Falhas' },
  { key: 'pending', label: 'Pendentes' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEventColor(type = '') {
  const t = (type ?? '').toLowerCase()
  for (const [key, color] of Object.entries(EVENT_COLORS)) {
    if (t.includes(key)) return color
  }
  return '#888780'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ status }) {
  const meta = STATUS_META[status] ?? { bg: '#f0f0f0', color: '#888', label: status }
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10, fontWeight: 500,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 20,
      background: meta.bg, color: meta.color,
    }}>
      {meta.label}
    </span>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '14px 16px', flex: 1 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6, letterSpacing: '0.02em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: color ?? '#111' }}>{value}</div>
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function NewNotificationForm({ onClose, onSuccess }) {
  const [eventType, setEventType] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [contentType, setContentType] = useState('html');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          event_type: eventType.trim() !== '' ? eventType.trim() : null,
          recipient: recipient,
          subject: subject,
          content_type: contentType,
          body: body,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));

        // Tratamento específico para erros de validação do Laravel (422)
        if (res.status === 422 && errData.errors) {
          const validationMessages = Object.values(errData.errors).flat().join(' | ');
          throw new Error(`Validação: ${validationMessages}`);
        }

        throw new Error(errData.message || 'Erro ao comunicar com a API.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: '0.5px solid #ccc', fontFamily: 'inherit',
    fontSize: 13, boxSizing: 'border-box', background: '#fff',
    color: '#111', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, color: '#888',
    marginBottom: 5, letterSpacing: '0.03em', textTransform: 'lowercase',
  };

  return (
    <div style={{
      border: '0.5px solid #e0e0e0', borderRadius: 12, background: '#fff',
      padding: '20px 24px', marginBottom: 24,
      animation: 'slideDown 0.18s ease',
    }}>
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>Nova notificação</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#aaa', lineHeight: 1, padding: '0 2px' }}
          aria-label="Fechar"
        >×</button>
      </div>

      {formError && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#A32D2D', marginBottom: 14 }}>
          {formError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Marcador + Tipo lado a lado */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>marcador (opcional)</label>
            <input
              type="text"
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              placeholder="Ex: alerta_venda"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>tipo</label>
            <select
              value={contentType}
              onChange={e => setContentType(e.target.value)}
              style={inputStyle}
            >
              <option value="html">HTML</option>
              <option value="text">Texto Plano</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>e-mail do destinatário</label>
          <input
            type="email"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            required
            placeholder="email@exemplo.com"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          />
        </div>

        <div>
          <label style={labelStyle}>assunto</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            placeholder="Assunto do e-mail"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>corpo da mensagem</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={6}
            placeholder={contentType === 'html' ? '<h1>Título</h1>\n<p>Texto</p>' : 'Digite o texto aqui...'}
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '7px 16px', borderRadius: 6, border: '0.5px solid #ccc', background: 'transparent', color: '#666', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: submitting ? '#555' : '#111', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'background 0.15s' }}
          >
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function NotificationPanel() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const pollingRef = useRef(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
      const data = await res.json()
      setLogs(data.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Polling: enquanto houver pendentes, consulta a cada 3 s ───────────────

  useEffect(() => {
    const hasPending = logs.some(l => l.status === 'pending')

    if (hasPending) {
      pollingRef.current = setInterval(() => load(true), 3000)
    } else {
      clearInterval(pollingRef.current)
    }

    return () => clearInterval(pollingRef.current)
  }, [logs, load])

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter)
  const pending = logs.filter(l => l.status === 'pending').length
  const sent = logs.filter(l => l.status === 'sent').length
  const failed = logs.filter(l => l.status === 'failed').length

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '0.5px solid #e0e0e0', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: '#111' }}>Notificações</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '3px 0 0' }}>
            {loading
              ? 'Carregando...'
              : error
                ? 'Erro ao carregar dados'
                : <>
                  {logs.length} registro{logs.length !== 1 ? 's' : ''}
                  {pending > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#854F0B' }}>
                      · {pending} pendente{pending !== 1 ? 's' : ''} — atualizando automaticamente
                    </span>
                  )}
                </>
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: 'none', background: showForm ? '#444' : '#111', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
          >
            {showForm ? '× Cancelar' : '+ Nova notificação'}
          </button>
          <button
            onClick={() => load()}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '0.5px solid #ccc', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <NewNotificationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { load(); setShowForm(false) }}
        />
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#A32D2D', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="total de registros" value={loading ? '—' : logs.length} />
        <StatCard label="entregues" value={loading ? '—' : sent} color="#1D9E75" />
        <StatCard label="com falha" value={loading ? '—' : failed} color="#E24B4A" />
        <StatCard label="pendentes" value={loading ? '—' : pending} color={pending > 0 ? '#BA7517' : undefined} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 20,
              border: '0.5px solid',
              borderColor: filter === f.key ? '#111' : '#ccc',
              background: filter === f.key ? '#111' : 'transparent',
              color: filter === f.key ? '#fff' : '#888',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '15%' }} />
            <col />
          </colgroup>
          <thead style={{ background: '#f5f5f3' }}>
            <tr>
              {['#', 'Evento', 'Destinatário', 'Status', 'Data'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', textAlign: 'left', borderBottom: '0.5px solid #e0e0e0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, fontSize: 13, color: '#aaa' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, fontSize: 13, color: '#bbb' }}>Nenhum registro encontrado.</td></tr>
            ) : (
              filtered.map(log => (
                <tr
                  key={log.id}
                  style={{ borderBottom: '0.5px solid #f0f0f0', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 11, color: '#bbb' }}>
                    {String(log.id).padStart(3, '0')}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: getEventColor(log.event_type), flexShrink: 0 }} />
                      {log.event_type ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.recipient}>
                    {log.recipient ?? '—'}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <Badge status={log.status} />
                    {log.status === 'pending' && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: '#BA7517' }} title="Aguardando processamento">⟳</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#999', fontFamily: 'monospace' }}>
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}