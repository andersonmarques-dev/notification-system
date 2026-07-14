import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { api } from "./api";
import RegisterScreen from './contexts/RegisterScreen'

// ─── Paleta ───────────────────────────────────────────────────────────────────

const GRAD = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'

const EVENT_COLORS = {
  email: '#4f46e5',
  sms: '#1D9E75',
  push: '#7F77DD',
  webhook: '#D85A30',
}

const STATUS_META = {
  sent: { bg: '#E1F5EE', color: '#0F6E56', label: 'Enviado' },
  failed: { bg: '#FCEBEB', color: '#A32D2D', label: 'Falha' },
  pending: { bg: '#EEF2FF', color: '#4338CA', label: 'Pendente' },
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
  return '#a5b4fc'
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
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 20,
      background: meta.bg, color: meta.color,
    }}>
      {meta.label}
    </span>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 18px', flex: 1,
      boxShadow: '0 1px 4px rgba(79,70,229,0.07)', border: '1px solid #ede9fe',
    }}>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: color ?? '#1e1b4b' }}>{value}</div>
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function NewNotificationForm({ onClose, onSuccess }) {
  const [eventType, setEventType] = useState('')
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [contentType, setContentType] = useState('html')
  const [body, setBody] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await api.post('/notifications', {
        event_type: eventType.trim() !== '' ? eventType.trim() : null,
        recipient,
        subject,
        content_type: contentType,
        body,
        webhook_url: webhookUrl.trim() !== '' ? webhookUrl.trim() : null,
      })
      onSuccess()
      onClose()
    } catch (err) {
      if (err.response?.status === 422) {
        const details = err.response.data.error?.details
        if (details) {
          setFormError(`Validação: ${Object.values(details).flat().join(' | ')}`)
          return
        }
      }
      setFormError(err.response?.data?.error?.message || err.message || 'Erro ao comunicar com a API.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid #ddd6fe', fontFamily: 'inherit',
    fontSize: 13, boxSizing: 'border-box', background: '#faf5ff',
    color: '#1e1b4b', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, color: '#7c3aed',
    marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500,
  }

  return (
    <div style={{
      border: '1px solid #ddd6fe', borderRadius: 14, background: '#fff',
      padding: '20px 24px', marginBottom: 24,
      boxShadow: '0 4px 20px rgba(79,70,229,0.08)',
      animation: 'slideDown 0.18s ease',
    }}>
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div style={{ background: GRAD, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '0.03em' }}>✦ Nova notificação</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', fontSize: 15, color: '#fff', lineHeight: 1, padding: '2px 7px', borderRadius: 6 }} aria-label="Fechar">×</button>
      </div>

      {formError && (
        <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#A32D2D', marginBottom: 14 }}>
          {formError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>marcador (opcional)</label>
            <input type="text" value={eventType} onChange={e => setEventType(e.target.value)} placeholder="Ex: alerta_venda" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>tipo</label>
            <select value={contentType} onChange={e => setContentType(e.target.value)} style={inputStyle}>
              <option value="html">HTML</option>
              <option value="text">Texto Plano</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>e-mail do destinatário</label>
          <input type="email" value={recipient} onChange={e => setRecipient(e.target.value)} required placeholder="email@exemplo.com" style={inputStyle} onKeyDown={e => e.key === 'Enter' && e.preventDefault()} />
        </div>
        <div>
          <label style={labelStyle}>assunto</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Assunto do e-mail" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>url do webhook (opcional)</label>
          <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://webhook.site/seu-id-unico" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>corpo da mensagem</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={6}
            placeholder={contentType === 'html' ? '<h1>Título</h1>\n<p>Texto</p>' : 'Digite o texto aqui...'}
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #ddd6fe', background: 'transparent', color: '#7c3aed', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: submitting ? 'rgba(79,70,229,0.6)' : GRAD, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, transition: 'opacity 0.15s' }}>
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Painel principal ─────────────────────────────────────────────────────────

function NotificationPanel() {
  const { logout, user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const pollingRef = useRef(null)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (pageNumber = 1, silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/notifications?page=${pageNumber}`)
      setLogs(res.data.data ?? [])
      setPage(res.data.current_page ?? 1)
      setLastPage(res.data.last_page ?? 1)
      setTotal(res.data.total ?? 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1) }, [load])

  useEffect(() => {
    const hasPending = logs.some(l => l.status === 'pending')
    if (!hasPending) return

    let cancelled = false
    const poll = async () => {
      if (cancelled) return
      await load(page, true)
      if (!cancelled) {
        pollingRef.current = setTimeout(poll, 3000)
      }
    }
    pollingRef.current = setTimeout(poll, 3000)

    return () => {
      cancelled = true
      clearTimeout(pollingRef.current)
    }
  }, [logs, load, page])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter)
  const pending = logs.filter(l => l.status === 'pending').length
  const sent = logs.filter(l => l.status === 'sent').length
  const failed = logs.filter(l => l.status === 'failed').length

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'system-ui, sans-serif', maxWidth: 920, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: GRAD, borderRadius: 14, padding: '18px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.18)' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.01em' }}>✦ Notify</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '3px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {loading ? 'Carregando...' : error ? 'Erro ao carregar dados' : (
              <>
                sistema de notificações
                {pending > 0 && <span style={{ marginLeft: 8, color: '#fde68a' }}>· {pending} pendente{pending !== 1 ? 's' : ''} — atualizando</span>}
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowForm(v => !v)} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.5)', background: showForm ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'background 0.15s' }}>
            {showForm ? '× Cancelar' : '+ Nova notificação'}
          </button>
          <button onClick={() => load(page)} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↻ Atualizar
          </button>
          <button onClick={logout} title={`Sair (${user?.email ?? ''})`} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sair
          </button>
        </div>
      </div>

      {showForm && <NewNotificationForm onClose={() => setShowForm(false)} onSuccess={() => { load(1); setShowForm(false) }} />}

      {error && (
        <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#A32D2D', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="total de registros" value={loading ? '—' : total} color="#4f46e5" />
        <StatCard label="entregues" value={loading ? '—' : sent} color="#1D9E75" />
        <StatCard label="com falha" value={loading ? '—' : failed} color="#E24B4A" />
        <StatCard label="pendentes" value={loading ? '—' : pending} color={pending > 0 ? '#7c3aed' : '#94a3b8'} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, border: '1px solid', borderColor: filter === f.key ? 'transparent' : '#ddd6fe', background: filter === f.key ? GRAD : 'transparent', color: filter === f.key ? '#fff' : '#7c3aed', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', fontWeight: filter === f.key ? 600 : 400 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #ede9fe', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(79,70,229,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '15%' }} />
            <col />
          </colgroup>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
              {['#', 'Evento', 'Destinatário', 'Status', 'Data'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '11px 16px', textAlign: 'left', borderBottom: '1px solid #ddd6fe' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 36, fontSize: 13, color: '#a5b4fc' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 44, fontSize: 13, color: '#c4b5fd' }}>Nenhum registro encontrado.</td></tr>
            ) : (
              filtered.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f5f3ff', transition: 'background 0.1s', background: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#c4b5fd' }}>{String(log.id).padStart(3, '0')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#1e1b4b' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: getEventColor(log.event_type), flexShrink: 0 }} />
                      {log.event_type ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.recipient}>{log.recipient ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge status={log.status} />
                    {log.status === 'pending' && <span style={{ marginLeft: 6, fontSize: 10, color: '#7c3aed' }} title="Aguardando processamento">⟳</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{formatDate(log.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          Mostrando página <strong style={{ color: '#7c3aed' }}>{page}</strong> de {lastPage} ({total} registros no total)
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => load(page - 1)} disabled={page <= 1 || loading} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd6fe', background: 'transparent', color: '#7c3aed', cursor: page <= 1 || loading ? 'not-allowed' : 'pointer', opacity: page <= 1 || loading ? 0.4 : 1, fontFamily: 'inherit' }}>
            ← Anterior
          </button>
          <button onClick={() => load(page + 1)} disabled={page >= lastPage || loading} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd6fe', background: 'transparent', color: '#7c3aed', cursor: page >= lastPage || loading ? 'not-allowed' : 'pointer', opacity: page >= lastPage || loading ? 0.4 : 1, fontFamily: 'inherit' }}>
            Próxima →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tela de Login ────────────────────────────────────────────────────────────

function LoginScreen({ onGoToRegister }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 422) {
        setError('Credenciais inválidas. Tente novamente.')
      } else if (err.response?.status >= 500) {
        setError('Servidor indisponível. Tente novamente mais tarde.')
      } else if (!err.response) {
        setError('Sem conexão com o servidor. Verifique sua internet.')
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd6fe',
    borderRadius: 8, boxSizing: 'border-box', fontFamily: 'inherit',
    fontSize: 14, background: '#faf5ff', color: '#1e1b4b', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f3ff' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(79,70,229,0.12)', width: '100%', maxWidth: 400, overflow: 'hidden' }}>

        {/* Cabeçalho com gradiente */}
        <div style={{ background: GRAD, padding: '28px 32px 24px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>✦ Notify</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>sistema de notificações</div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', marginBottom: 20 }}>Acesso ao sistema</div>

          {error && (
            <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: 18 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#7c3aed', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#7c3aed', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: loading ? 'rgba(79,70,229,0.6)' : GRAD, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, transition: 'opacity 0.15s' }}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
          {onGoToRegister && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Não tem conta? </span>
              <button onClick={onGoToRegister} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#7c3aed', fontFamily: 'inherit', fontWeight: 500, padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Cadastre-se
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Roteador privado ─────────────────────────────────────────────────────────

function MainApp() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState('login') // 'login' | 'register'

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f3ff' }}>
        <div style={{ fontSize: 13, color: '#a5b4fc', letterSpacing: '0.06em' }}>Verificando sessão...</div>
      </div>
    )
  }

  if (user) return <NotificationPanel />

  if (screen === 'register') return <RegisterScreen onBackToLogin={() => setScreen('login')} />

  return <LoginScreen onGoToRegister={() => setScreen('register')} />
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}