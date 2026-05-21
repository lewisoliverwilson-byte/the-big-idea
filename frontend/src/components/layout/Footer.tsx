import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-500 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Wordmark */}
          <div className="flex items-center gap-2 select-none">
            <div style={{
              width:        26,
              height:       26,
              background:   '#4F46E5',
              borderRadius: 6,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              fontFamily:   '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:   700,
              fontSize:     15,
              color:        '#fff',
              letterSpacing: '-0.02em',
              lineHeight:   1,
              flexShrink:   0,
            }}>
              S
            </div>
            <span style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:    700,
              fontSize:      17,
              color:         '#fff',
              letterSpacing: '-0.01em',
              lineHeight:    1,
            }}>
              Sourcery
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/pricing"      className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/auth/signin"  className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/auth/signup"  className="hover:text-white transition-colors">Sign up</Link>
          </div>

          <p className="text-sm">
            © {new Date().getFullYear()} Sourcery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
