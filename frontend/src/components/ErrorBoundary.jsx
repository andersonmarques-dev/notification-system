import React from 'react'

const GRAD = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', minHeight: '100vh', alignItems: 'center',
          justifyContent: 'center', background: '#f5f3ff', fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0 8px 32px rgba(79,70,229,0.12)',
            width: '100%', maxWidth: 440, overflow: 'hidden',
          }}>
            <div style={{ background: GRAD, padding: '28px 32px 24px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>✦ Notify</div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>erro inesperado</div>
            </div>
            <div style={{ padding: '28px 32px 32px' }}>
              <p style={{ fontSize: 14, color: '#1e1b4b', marginBottom: 8 }}>
                Algo deu errado na aplicação.
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                  background: GRAD, color: '#fff', cursor: 'pointer',
                  fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
