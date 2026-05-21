import { Link } from 'react-router-dom'

const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'

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
            <div style={{
              width:          26,
              height:         26,
              background:     GRAD,
              borderRadius:   7,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontFamily:     '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:     700,
              fontSize:       15,
              color:          '#fff',
              letterSpacing:  '-0.02em',
              lineHeight:     1,
              flexShrink:     0,
              boxShadow:      '0 0 10px rgba(139,92,246,0.3)',
            }}>
              S
            </div>
            <span style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:    700,
              fontSize:      17,
              color:         '#F0EEFF',
              letterSpacing: '-0.01em',
              lineHeight:    1,
            }}>
              Sourcery
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
            © {new Date().getFullYear()} Sourcery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
