import { Link } from 'react-router-dom'


export function Footer() {
  return (
    <footer style={{
      background:  '#070511',
      borderTop:   '1px solid rgba(139,92,246,0.12)',
      padding:     '40px 0',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Wordmark */}
          <div className="flex items-center gap-2.5 select-none">
            <svg viewBox="0 0 100 100" width={26} height={26} aria-hidden="true">
              <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M 33,79 A 34,34 0 1,1 67,79" fill="none" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" opacity="0.28"/>
              <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
              <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
              <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
            </svg>
            <span style={{
              fontFamily:    '"Cinzel Decorative", "Cinzel", serif',
              fontWeight:    700,
              fontSize:      15,
              color:         '#DDD6FE',
              letterSpacing: '0.06em',
              lineHeight:    1,
            }}>
              Sorcery
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
                style={{
                  color:          '#5A4F7A',
                  textDecoration: 'none',
                  transition:     'color 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A78BFA')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#5A4F7A')}
              >
                {label}
              </Link>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#3D3358' }}>
            © {new Date().getFullYear()} Sorcery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
