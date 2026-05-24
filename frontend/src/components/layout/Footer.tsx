import { Link } from 'react-router-dom'
import { Logo } from './Navbar'

export function Footer() {
  return (
    <footer style={{
      background:  '#F8FAFC',
      borderTop:   '1px solid #E2E8F0',
      padding:     '32px 0',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Wordmark */}
          <div className="flex items-center gap-2 select-none">
            <Logo size={20} />
            <span style={{
              fontFamily:    'Inter, system-ui, sans-serif',
              fontWeight:    700,
              fontSize:      14,
              color:         '#0F172A',
              letterSpacing: '-0.02em',
            }}>
              Scout<span style={{ color: '#6366F1' }}>r</span>
            </span>
          </div>

          <div className="flex items-center gap-6" style={{ fontSize: 13 }}>
            {[
              { to: '/pricing',     label: 'Pricing' },
              { to: '/auth/signin', label: 'Sign in' },
              { to: '/auth/signup', label: 'Sign up' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-slate-500 hover:text-slate-800 transition-colors"
                style={{ textDecoration: 'none', fontSize: 13 }}
              >
                {label}
              </Link>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#94A3B8' }}>
            © {new Date().getFullYear()} Scoutr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
