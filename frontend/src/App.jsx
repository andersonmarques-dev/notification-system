import { useState, useEffect, useCallback } from 'react'

const EVENT_COLORS = {
  email: '#378ADD',
  sms: '#1D9E75',
  push: '#7F77DD',
  webhook: '#D85A30',
}

function getEventColor(type = '') {
  const t = type.toLowerCase()
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

const STATUS_STYLES = {
  sent: { bg: '#E1F5EE', color: '#0F6E56', label: 'Enviado' },
  failed: { bg: '#FCEBEB', color: '#A32D2D', label: 'Falha' },
  pending: { bg: '#FAEEDA', color: '#854F0B', label: 'Pendente' },
}

function Badge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 20,
      background: style.bg,
      color: style.color,
    }}>
      {STATUS_STYLES[status]?.label ?? status}
    </span>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#f5f5f3',
      borderRadius: 8,
      padding: '14px 16px',
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6, letterSpacing: '0.02em' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: color ?? '#111' }}>
        {value}
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'sent', label: 'Enviados' },
  { key: 'failed', label: 'Falhas' },
  { key: 'pending', label: 'Pendentes' },
]
function NewNotificationModal({ isOpen, onClose, onSuccess }) {
  const [eventType, setEventType] = useState('usuario_cadastrado');
  const [recipient, setRecipient] = useState('');
  const [payload, setPayload] = useState('{\n  "nome": "João Silva"\n}');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Altera o template do JSON consoante o evento selecionado
  const handleEventChange = (e) => {
    const val = e.target.value;
    setEventType(val);
    if (val === 'pedido_confirmado') {
      setPayload('{\n  "nome": "João Silva",\n  "numero_pedido": "12345"\n}');
    } else if (val === 'senha_recuperada') {
      setPayload('{\n  "nome": "João Silva",\n  "codigo": "987654"\n}');
    } else {
      setPayload('{\n  "nome": "João Silva"\n}');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payload);
    } catch (err) {
      setError('O Payload deve ser um JSON válido. Verifique as aspas e as vírgulas.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Faz o POST para a nossa API Laravel
      const res = await fetch('http://localhost:8000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          recipient: recipient,
          payload: parsedPayload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erro ao comunicar com a API.');
      }

      // Limpa o formulário, fecha o modal e recarrega a tabela
      setRecipient('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 999
    }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#111' }}>Nova Notificação</h2>

        {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#555' }}>Tipo de Evento</label>
            <select value={eventType} onChange={handleEventChange} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}>
              <option value="usuario_cadastrado">Usuário Cadastrado</option>
              <option value="pedido_confirmado">Pedido Confirmado</option>
              <option value="senha_recuperada">Senha Recuperada</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#555' }}>E-mail do Destinatário</label>
            <input type="email" value={recipient} onChange={e => setRecipient(e.target.value)} required placeholder="email@exemplo.com" style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#555' }}>Payload (JSON)</label>
            <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={5} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #ccc', fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#f0f0f0', color: '#333', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'A enviar...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default function NotificationPanel() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true)
    setError(null)

    fetch('http://localhost:8000/api/notifications')
      .then(res => {
        if (!res.ok) throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
        return res.json()
      })
      .then(data => {
        setLogs(data.data ?? [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter)

  const sent = logs.filter(l => l.status === 'sent').length
  const failed = logs.filter(l => l.status === 'failed').length

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '0.5px solid #e0e0e0', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          {/* ... o seu h1 e p continuam iguais ... */}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
          >
            + Nova Notificação
          </button>
          <button
            onClick={load}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '0.5px solid #ccc', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#A32D2D', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total de Registros" value={loading ? '—' : logs.length} />
        <StatCard label="Entregues" value={loading ? '—' : sent} color="#1D9E75" />
        <StatCard label="Com Falha" value={loading ? '—' : failed} color="#E24B4A" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 20,
              border: '0.5px solid',
              borderColor: filter === f.key ? '#111' : '#ccc',
              background: filter === f.key ? '#111' : 'transparent',
              color: filter === f.key ? '#fff' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
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
            <col style={{ width: '28%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '16%' }} />
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
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, fontSize: 13, color: '#aaa' }}>
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, fontSize: 13, color: '#bbb' }}>
                  Nenhum registro encontrado.
                </td>
              </tr>
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
      <NewNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={load}
      />
    </div>
  )
}