import React, { useState } from 'react'
import { useAuth } from './AuthContext'

const GRAD = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'

export default function RegisterScreen({ onBackToLogin }) {
  const { registerUser } = useAuth()

  const [tenantName,            setTenantName]            = useState('')
  const [userName,              setUserName]              = useState('')
  const [email,                 setEmail]                 = useState('')
  const [password,              setPassword]              = useState('')
  const [passwordConfirmation,  setPasswordConfirmation]  = useState('')
  const [error,                 setError]                 = useState(null)
  const [fieldErrors,           setFieldErrors]           = useState({})
  const [loading,               setLoading]               = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      await registerUser(tenantName, userName, email, password, passwordConfirmation)
      // Após registro com sucesso, o AuthContext já define o user
      // e o MainApp redireciona automaticamente para o NotificationPanel
    } catch (err) {
      if (err.response?.status === 422) {
        const details = err.response.data?.errors ?? err.response.data?.error?.details ?? {}
        setFieldErrors(details)
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error?.message ||
          'Não foi possível criar a conta. Tente novamente.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${fieldErrors[field] ? '#F7C1C1' : '#ddd6fe'}`,
    borderRadius: 8,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    fontSize: 14,
    background: fieldErrors[field] ? '#fff8f8' : '#faf5ff',
    color: '#1e1b4b',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  })

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    color: '#7c3aed',
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontWeight: 500,
  }

  const fieldErrorStyle = {
    fontSize: 11,
    color: '#A32D2D',
    marginTop: 4,
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f3ff',
      padding: '24px 16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(79,70,229,0.12)',
        width: '100%',
        maxWidth: 440,
        overflow: 'hidden',
      }}>

        {/* Cabeçalho com gradiente */}
        <div style={{ background: GRAD, padding: '28px 32px 24px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>✦ Notify</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            criar nova conta
          </div>
        </div>

        {/* Formulário */}
        <div style={{ padding: '28px 32px 32px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', marginBottom: 20 }}>
            Cadastro
          </div>

          {/* Erro geral */}
          {error && (
            <div style={{
              background: '#FCEBEB',
              border: '1px solid #F7C1C1',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#A32D2D',
              marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nome da empresa */}
            <div>
              <label style={labelStyle}>nome da empresa</label>
              <input
                type="text"
                value={tenantName}
                onChange={e => setTenantName(e.target.value)}
                required
                placeholder="Acme Ltda."
                style={inputStyle('tenant_name')}
              />
              {fieldErrors.tenant_name && (
                <div style={fieldErrorStyle}>{fieldErrors.tenant_name[0]}</div>
              )}
            </div>

            {/* Nome do usuário */}
            <div>
              <label style={labelStyle}>seu nome</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
                placeholder="João Silva"
                style={inputStyle('user_name')}
              />
              {fieldErrors.user_name && (
                <div style={fieldErrorStyle}>{fieldErrors.user_name[0]}</div>
              )}
            </div>

            {/* Divisor visual */}
            <div style={{ borderTop: '1px solid #ede9fe', margin: '2px 0' }} />

            {/* E-mail */}
            <div>
              <label style={labelStyle}>e-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={inputStyle('email')}
              />
              {fieldErrors.email && (
                <div style={fieldErrorStyle}>{fieldErrors.email[0]}</div>
              )}
            </div>

            {/* Senha */}
            <div>
              <label style={labelStyle}>senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle('password')}
              />
              {fieldErrors.password && (
                <div style={fieldErrorStyle}>{fieldErrors.password[0]}</div>
              )}
            </div>

            {/* Confirmação de senha */}
            <div>
              <label style={labelStyle}>confirmar senha</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle('password_confirmation')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
              />
              {fieldErrors.password_confirmation && (
                <div style={fieldErrorStyle}>{fieldErrors.password_confirmation[0]}</div>
              )}
            </div>

            {/* Botão principal */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 8,
                border: 'none',
                background: loading ? 'rgba(79,70,229,0.6)' : GRAD,
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                fontWeight: 600,
                marginTop: 4,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>

            {/* Link para login */}
            {onBackToLogin && (
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Já tem uma conta? </span>
                <button
                  onClick={onBackToLogin}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#7c3aed',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                  }}
                >
                  Entrar
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}