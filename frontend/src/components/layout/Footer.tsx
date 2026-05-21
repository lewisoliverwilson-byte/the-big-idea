import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-500 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 rounded-lg p-1.5">
              <TrendingUp className="h-4 w-4 text-slate-900" />
            </div>
            <span className="text-white font-semibold text-sm">The Big Idea</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/auth/signin" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/auth/signup" className="hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} The Big Idea. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
