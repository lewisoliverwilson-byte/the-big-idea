import { Link } from 'react-router-dom'
import { Wordmark } from './Navbar'

export function Footer() {
  return (
    <footer style={{
      background:  '#1A1817',
      borderTop:   '1px solid #3A332C',
      padding:     '32px 0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>

          {/* Reversed wordmark */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Wordmark height={20} variant="dark" />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { to: '/pricing',     label: 'Pricing' },
              { to: '/auth/signin', label: 'Sign in' },
              { to: '/auth/signup', label: 'Sign up' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  textDecoration: 'none', fontSize: 13,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#9A8B82', fontWeight: 500,
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F4EFE5')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9A8B82')}
              >
                {label}
              </Link>
            ))}
          </div>

          <p style={{
            fontSize: 12, color: '#6B6359',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            © {new Date().getFullYear()} Scoutr
          </p>
        </div>
      </div>
    </footer>
  )
}
