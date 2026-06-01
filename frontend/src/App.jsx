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
  sent:    { bg: '#E1F5EE', color: '#0F6E56', label: 'Enviado' },
  failed:  { bg: '#FCEBEB', color: '#A32D2D', label: 'Falha' },
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
  { key: 'all',     label: 'Todos' },
  { key: 'sent',    label: 'Enviados' },
  { key: 'failed',  label: 'Falhas' },
  { key: 'pending', label: 'Pendentes' },
]

export default function NotificationPanel() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

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

  const sent    = logs.filter(l => l.status === 'sent').length
  const failed  = logs.filter(l => l.status === 'failed').length

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '0.5px solid #e0e0e0', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: '#111' }}>Notificações</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '3px 0 0' }}>
            {loading ? 'Carregando...' : error ? 'Erro ao carregar dados' : `${logs.length} registro${logs.length !== 1 ? 's' : ''} encontrado${logs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={load}
          style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '0.5px solid #ccc', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
        >
          ↻ Atualizar
        </button>
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

    </div>
  )
}