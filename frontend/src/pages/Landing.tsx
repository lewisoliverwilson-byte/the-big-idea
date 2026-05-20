import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Search,
  BarChart2,
  DollarSign,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react'
import { Button } from '../components/ui/Button'

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Enter your parameters',
    description:
      'Tell us your budget, preferred product size, category, and target sell platform.',
  },
  {
    step: '02',
    icon: Globe,
    title: 'We scan the market',
    description:
      'Our AI scans Temu, AliExpress, and Alibaba for buy-side prices, then cross-references Amazon, eBay, and Etsy for sell-side data.',
  },
  {
    step: '03',
    icon: BarChart2,
    title: 'Get your report',
    description:
      'Receive a full research report with margin calculations, trend charts, platform comparison, and AI-written analysis.',
  },
]

const FEATURES = [
  { icon: Zap, title: 'Reports in under 30 seconds', desc: 'AI-powered, not manual guesswork' },
  { icon: TrendingUp, title: '12-month trend data', desc: 'See if a product is rising or fading' },
  { icon: DollarSign, title: 'Accurate margin estimates', desc: 'Fees, shipping, and profit per unit' },
  { icon: Shield, title: 'Risk scoring', desc: 'Understand saturation and downside before you buy' },
]

const FAQ = [
  {
    q: 'How accurate is the data?',
    a: 'Our scrapers pull live data from major platforms every 6 hours. Buy prices come directly from Temu, AliExpress, and Alibaba. Sell estimates are based on actual completed listings on Amazon, eBay, and Etsy.',
  },
  {
    q: "What's included in the free tier?",
    a: 'You get 2 complete market research reports for free. Each report includes the full AI analysis, margin calculator, trend charts, and platform comparison — no features withheld.',
  },
  {
    q: 'How is this different from just searching Google?',
    a: 'We aggregate buy-side and sell-side data simultaneously, calculate your actual margin after fees and shipping, show you 12 months of trend data, and generate a written analysis — in under 30 seconds.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, cancel anytime from your account settings. You\'ll keep access until the end of your billing period.',
  },
  {
    q: 'What platforms do you cover?',
    a: 'Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. More platforms are coming soon.',
  },
]

export function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            AI-powered market research in under 30 seconds
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Find dropshipping products{' '}
            <span className="text-indigo-600">worth buying</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Enter a budget. We scan Temu, AliExpress, and Alibaba for cheap buy prices — then find
            where you can sell them for maximum profit on Amazon, eBay, Etsy, or Shopify.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/signup">
              <Button variant="primary" size="lg">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">
                View pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            2 free reports. No credit card required.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Three steps from idea to informed decision</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 h-full">
                  <div className="text-4xl font-black text-indigo-100 mb-4">{step}</div>
                  <div className="bg-indigo-600 rounded-xl p-3 w-fit mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report preview */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              What you'll get in every report
            </h2>
            <p className="text-gray-500">
              Every report is packed with real data — not generic advice
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="bg-indigo-50 rounded-lg w-10 h-10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mock report preview */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400 text-xs ml-2">Sample Report — Portable LED Ring Light</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Buy price', value: '$2.40', sub: 'Temu · MOQ 50', color: 'text-gray-900' },
                { label: 'Avg. sell price', value: '$24.99', sub: 'Amazon (recommended)', color: 'text-gray-900' },
                { label: 'Estimated margin', value: '58%', sub: 'After fees & shipping', color: 'text-green-600' },
                { label: 'Opportunity score', value: '8/10', sub: 'Trending ↑ 31% YoY', color: 'text-indigo-600' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4 bg-indigo-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start finding profitable products today
          </h2>
          <p className="text-indigo-200 mb-8">
            2 free reports to prove the value. Upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Get 2 free reports
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <span className="text-indigo-200 hover:text-white text-sm underline cursor-pointer">
                See pricing
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">FAQ</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-gray-50 rounded-xl border border-gray-200 px-6 py-4"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900">
                  {q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="text-gray-600 text-sm leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
