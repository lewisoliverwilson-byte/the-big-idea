import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import {
  ArrowRight, ChevronLeft, Check,
  TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe, Sparkles,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { QuizAnswers } from '../types'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#070511',
  surface:     '#0E0A1C',
  surface2:    '#150F28',
  border:      'rgba(139,92,246,0.15)',
  borderGlow:  'rgba(139,92,246,0.45)',
  purple:      '#8B5CF6',
  purpleBright:'#A78BFA',
  cyan:        '#22D3EE',
  gold:        '#F59E0B',
  text:        '#F0EEFF',
  textDim:     '#9B8ECF',
  textMuted:   '#5A4F7A',
} as const

// ─── Gradient helpers ─────────────────────────────────────────────────────────
const GRAD  = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN  = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GTEXT: CSSProperties = {
  background:           GRAD,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor:  'transparent',
  backgroundClip:       'text',
}

// ─── Stars (deterministic — golden-angle distribution) ────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => {
  const g = 137.508
  return {
    left:    `${((i * g)        % 100).toFixed(1)}%`,
    top:     `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:    [1, 1, 1, 1.5, 2][i % 5],
    delay:   `${((i * 0.37)     % 4.5).toFixed(2)}s`,
    dur:     `${(2.8 + (i % 6)  * 0.45).toFixed(1)}s`,
  }
})

// ─── Brand ────────────────────────────────────────────────────────────────────
export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  const r = Math.round(size * 0.22)
  return (
    <div
      aria-label="Sourcery"
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{
        width: size, height: size,
        background: C.surface,
        borderRadius: r,
        border: `1px solid ${C.borderGlow}`,
        boxShadow: `0 0 10px rgba(139,92,246,0.2)`,
      }}
    >
      <span style={{
        ...GTEXT,
        fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
        fontWeight:    700,
        fontSize:      Math.round(size * 0.58),
        letterSpacing: '-0.02em',
        lineHeight:    1,
      }}>
        S
      </span>
    </div>
  )
}

function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 30
  const fontSize = size === 'sm' ? 17 : size === 'lg' ? 26 : 20
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Logo size={iconSize} />
      <span style={{
        fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
        fontWeight:    700, fontSize, letterSpacing: '-0.01em', lineHeight: 1,
        color: C.text,
      }}>
        Sourcery
      </span>
    </div>
  )
}

// ─── Quiz data ────────────────────────────────────────────────────────────────
const STEPS = 5

interface QuizOption { id: string; emoji: string; label: string; sublabel: string }

const QUIZ_QUESTIONS: { step: number; title: string; options: QuizOption[] }[] = [
  {
    step: 1, title: "What's your starting budget?",
    options: [
      { id: '175',  emoji: '🌱', label: '£100 – £250',   sublabel: 'Just getting started' },
      { id: '375',  emoji: '📈', label: '£250 – £500',   sublabel: 'Ready to invest' },
      { id: '1000', emoji: '💼', label: '£500 – £1,500', sublabel: 'Serious about this' },
      { id: '2000', emoji: '🚀', label: '£1,500+',       sublabel: 'All in' },
    ],
  },
  {
    step: 2, title: 'How much storage do you have?',
    options: [
      { id: 'small',  emoji: '📦', label: 'Small',    sublabel: 'Bag or jiffy bag' },
      { id: 'medium', emoji: '🗂️', label: 'Medium',   sublabel: 'Shoebox size' },
      { id: 'large',  emoji: '📫', label: 'Large',    sublabel: 'Takes up a shelf' },
      { id: 'xlarge', emoji: '🏭', label: 'Any size', sublabel: "I'll use a fulfilment centre" },
    ],
  },
  {
    step: 3, title: 'What products interest you?',
    options: [
      { id: 'Home & Garden',   emoji: '🏠', label: 'Home & Gadgets',  sublabel: 'Practical everyday items' },
      { id: 'Beauty & Health', emoji: '✨', label: 'Beauty & Health', sublabel: 'Skincare, wellness, grooming' },
      { id: 'Toys & Games',    emoji: '🎮', label: 'Toys & Hobbies',  sublabel: 'Games, collectibles, fun' },
      { id: 'No preference',   emoji: '🎲', label: 'Surprise me',     sublabel: 'Best opportunity wins' },
    ],
  },
  {
    step: 4, title: 'Where do you want to sell?',
    options: [
      { id: 'amazon', emoji: '📦', label: 'Amazon',       sublabel: 'Biggest marketplace' },
      { id: 'ebay',   emoji: '🛒', label: 'eBay',         sublabel: 'Great for unique items' },
      { id: 'etsy',   emoji: '🎨', label: 'Etsy',         sublabel: 'Niche & creative products' },
      { id: 'any',    emoji: '🤷', label: "I'm not sure", sublabel: 'Show me the best option' },
    ],
  },
  {
    step: 5, title: "What's your main goal?",
    options: [
      { id: 'volume',   emoji: '⚡', label: 'Quick wins',        sublabel: 'Fast-selling, high volume' },
      { id: 'margin',   emoji: '💰', label: 'Big margins',       sublabel: 'Fewer sales, higher profit' },
      { id: 'trending', emoji: '🔥', label: 'Trending products', sublabel: 'Only upward-momentum items' },
      { id: 'safe',     emoji: '🛡️', label: 'Low risk',          sublabel: 'Safe, proven products' },
    ],
  },
]

// ─── Storage helpers ──────────────────────────────────────────────────────────
export function getQuizFromStorage(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem('bigidea_quiz')
    return raw ? (JSON.parse(raw) as QuizAnswers) : null
  } catch { return null }
}
export function clearQuizFromStorage() { localStorage.removeItem('bigidea_quiz') }
function saveQuizToStorage(answers: Partial<QuizAnswers>) {
  localStorage.setItem('bigidea_quiz', JSON.stringify(answers))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MagicDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 40px', margin: '0 auto', maxWidth: 900 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.border}, transparent)` }} />
      <span style={{ color: C.purple, fontSize: 10, opacity: 0.7 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.border}, transparent)` }} />
    </div>
  )
}

function QuizProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.textMuted }}>
        <span>INCANTATION {step} OF {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 2, borderRadius: 9999, background: 'rgba(139,92,246,0.12)' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: GRAD,
          transition: 'width 0.4s ease-out',
          boxShadow: '0 0 8px rgba(139,92,246,0.6)',
        }} />
      </div>
    </div>
  )
}

function QuizOpt({ option, selected, onClick }: {
  option: QuizOption; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 14px', borderRadius: 10,
        background: selected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
        border: `1.5px solid ${selected ? C.borderGlow : C.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'all 140ms',
        boxShadow: selected ? '0 0 12px rgba(139,92,246,0.15)' : 'none',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{option.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
          color: selected ? C.purpleBright : C.text, margin: 0,
        }}>
          {option.label}
        </p>
        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, margin: '2px 0 0' }}>
          {option.sublabel}
        </p>
      </div>
      {selected && (
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: GBTN,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(124,58,237,0.5)',
        }}>
          <Check style={{ width: 10, height: 10, color: '#fff' }} />
        </div>
      )}
    </button>
  )
}

// ─── Report preview components ────────────────────────────────────────────────
function Sparkline() {
  const vals = [32, 37, 35, 42, 41, 49, 54, 57, 63, 72, 84, 100]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
      {vals.map((h, i) => {
        const t = i / 11
        const r = Math.round(196 - t * (196 - 34))
        const g = Math.round(132 - t * (132 - 211))
        const b = Math.round(252 - t * (252 - 238))
        return (
          <div key={i} style={{
            height: `${h}%`, width: 7, borderRadius: 2, flexShrink: 0,
            background: `rgb(${r},${g},${b})`,
            opacity: 0.6 + t * 0.4,
          }} />
        )
      })}
    </div>
  )
}

function Tile({ label, value, sub, accent = false }: {
  label: string; value: string; sub: string; accent?: boolean
}) {
  return (
    <div style={{ flex: 1, borderRadius: 8, padding: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}` }}>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 17, color: accent ? C.purpleBright : C.text, lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: accent ? C.purpleBright : C.textMuted, margin: '3px 0 0' }}>
        {sub}
      </p>
    </div>
  )
}

function Badge({ label, value, risk = false }: { label: string; value: string; risk?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6, padding: '4px 8px',
      background: risk ? 'rgba(245,158,11,0.08)' : 'rgba(139,92,246,0.10)',
      border:     risk ? '1px solid rgba(245,158,11,0.22)' : `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, letterSpacing: '0.06em', fontWeight: 700, color: risk ? C.gold : C.purpleBright }}>
        {label}
      </span>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 13, color: risk ? C.gold : C.purpleBright }}>
        {value}
      </span>
    </div>
  )
}

function PlatBar({ name, pct }: { name: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textDim, width: 44, flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 9999, background: 'rgba(139,92,246,0.08)' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: `linear-gradient(to right, rgba(124,58,237,0.7), rgba(99,102,241,${(0.4 + pct / 100 * 0.6).toFixed(2)}))`,
          boxShadow: `0 0 6px rgba(124,58,237,${(0.2 + pct / 100 * 0.3).toFixed(2)})`,
        }} />
      </div>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.textMuted, width: 28, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

// ─── Section data ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    n: '01', icon: Sparkles,
    title: 'Speak Your Intent',
    desc:  'Budget, storage, category, platform, and goal. Five questions, under 60 seconds. Your criteria become the spell.',
  },
  {
    n: '02', icon: BarChart2,
    title: 'We Scry the Markets',
    desc:  'Buy prices from Temu, AliExpress and Alibaba cross-referenced against Amazon, eBay, Etsy and Shopify. 1,000+ products, instantly.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Your Fortune Appears',
    desc:  'AI analysis, 6-month trend charts, exact margin breakdown, and direct buy links — conjured in under 30 seconds.',
  },
]

const FEATURES = [
  { icon: Zap,         title: 'AI market analysis',  desc: 'GPT-4o writes a full opportunity analysis, competitive overview, and recommended strategy tailored to your inputs.' },
  { icon: TrendingUp,  title: '6-month trend data',  desc: 'See whether a product is rising, falling, or seasonal before you commit a single penny.' },
  { icon: DollarSign,  title: 'Margin calculator',   desc: 'Source price, shipping, and platform fees all factored in. Profit per unit at 50, 100, and 200 units.' },
  { icon: BarChart2,   title: 'Platform comparison', desc: 'Amazon vs eBay vs Etsy vs Shopify — margins, fees, monthly sales estimates, and difficulty side by side.' },
  { icon: Globe,       title: 'Direct source links', desc: 'One-click through to the exact listing on Temu, AliExpress, or Alibaba. No searching required.' },
  { icon: ShieldCheck, title: 'Risk scoring',        desc: 'Saturated niches, downward trends, and high MOQ risk flagged before you spend anything.' },
]

// ─── Shared card style ────────────────────────────────────────────────────────
const GLASS: CSSProperties = {
  background:     `rgba(14,10,28,0.70)`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:         `1px solid ${C.border}`,
  borderRadius:   16,
  boxShadow:      '0 0 0 1px rgba(139,92,246,0.06), 0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
}

// ─── Forest atmosphere ───────────────────────────────────────────────────────

function CastleSVG() {
  return (
    <svg viewBox="0 0 500 300" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="cMoon" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#8AAAD0" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#050810" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Moon halo behind castle */}
      <ellipse cx="250" cy="130" rx="210" ry="120" fill="url(#cMoon)"/>
      {/* Ground strip */}
      <rect x="0"   y="266" width="500"  height="34" fill="#060A09"/>
      {/* Outer curtain walls */}
      <rect x="0"   y="228" width="88"   height="72" fill="#090C18"/>
      <rect x="412" y="228" width="88"   height="72" fill="#090C18"/>
      {/* Left outer wall battlements */}
      <rect x="0"  y="220" width="11" height="8" fill="#090C18"/>
      <rect x="15" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="30" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="45" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="60" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="75" y="220" width="11" height="8" fill="#090C18"/>
      {/* Right outer wall battlements */}
      <rect x="414" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="429" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="444" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="459" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="474" y="220" width="11" height="8" fill="#090C18"/>
      <rect x="488" y="220" width="11" height="8" fill="#090C18"/>
      {/* Left tower */}
      <rect x="88"  y="165" width="72" height="135" fill="#0B0E1C"/>
      <rect x="88"  y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="104" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="120" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="136" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="148" y="156" width="12" height="9"   fill="#0B0E1C"/>
      {/* Right tower */}
      <rect x="340" y="165" width="72" height="135" fill="#0B0E1C"/>
      <rect x="340" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="356" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="372" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="388" y="156" width="12" height="9"   fill="#0B0E1C"/>
      <rect x="400" y="156" width="12" height="9"   fill="#0B0E1C"/>
      {/* Connecting curtain walls */}
      <rect x="160" y="210" width="55" height="90" fill="#090B17"/>
      <rect x="285" y="210" width="55" height="90" fill="#090B17"/>
      {/* Main keep */}
      <rect x="178" y="88" width="144" height="212" fill="#0C0F1F"/>
      <rect x="178" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="195" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="212" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="229" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="246" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="263" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="280" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="297" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      <rect x="309" y="77" width="13"  height="11"  fill="#0C0F1F"/>
      {/* Gate arch */}
      <path d="M224,300 L224,248 Q250,223 276,248 L276,300 Z" fill="#04050E"/>
      {/* Portcullis */}
      <line x1="224" y1="252" x2="276" y2="252" stroke="#07080F" strokeWidth="1.5" opacity="0.5"/>
      <line x1="224" y1="264" x2="276" y2="264" stroke="#07080F" strokeWidth="1.5" opacity="0.5"/>
      <line x1="237" y1="248" x2="237" y2="300" stroke="#07080F" strokeWidth="1.5" opacity="0.5"/>
      <line x1="250" y1="248" x2="250" y2="300" stroke="#07080F" strokeWidth="1.5" opacity="0.5"/>
      <line x1="263" y1="248" x2="263" y2="300" stroke="#07080F" strokeWidth="1.5" opacity="0.5"/>
      {/* Keep windows — faint amber glow */}
      <rect x="208" y="118" width="14" height="20" fill="rgba(200,120,20,0.11)" rx="2" ry="4"/>
      <rect x="278" y="118" width="14" height="20" fill="rgba(200,120,20,0.07)" rx="2" ry="4"/>
      <rect x="243" y="113" width="14" height="22" fill="rgba(200,120,20,0.09)" rx="2" ry="5"/>
      <rect x="208" y="166" width="14" height="20" fill="rgba(200,120,20,0.08)" rx="2" ry="4"/>
      <rect x="278" y="166" width="14" height="20" fill="rgba(200,120,20,0.06)" rx="2" ry="4"/>
      <rect x="243" y="166" width="14" height="20" fill="rgba(200,120,20,0.07)" rx="2" ry="4"/>
      {/* Tower windows */}
      <rect x="116" y="192" width="10" height="16" fill="rgba(200,120,20,0.07)" rx="1" ry="3"/>
      <rect x="374" y="192" width="10" height="16" fill="rgba(200,120,20,0.07)" rx="1" ry="3"/>
      {/* Flagpole + banner */}
      <line x1="250" y1="77" x2="250" y2="42" stroke="#14162C" strokeWidth="2.5" opacity="0.8"/>
      <path d="M250,42 L270,51 L250,60 Z" fill="#1A1C38" opacity="0.6"/>
      <line x1="140" y1="156" x2="140" y2="132" stroke="#12142A" strokeWidth="2" opacity="0.7"/>
      <path d="M140,132 L154,138 L140,144 Z" fill="#161830" opacity="0.55"/>
    </svg>
  )
}

function ForestTrees() {
  return (
    <svg viewBox="0 0 350 900" preserveAspectRatio="xMinYMax meet"
      style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* ── Far background pines ── */}
      <g opacity="0.22" fill="#020303">
        <polygon points="312,900 288,640 336,640"/>
        <polygon points="312,728 293,558 331,558"/>
        <polygon points="312,608 298,476 326,476"/>
        <rect x="305" y="860" width="14" height="40"/>
        <polygon points="268,900 248,700 288,700"/>
        <polygon points="268,780 252,618 284,618"/>
        <rect x="261" y="865" width="14" height="35"/>
      </g>
      {/* ── Mid-ground pine ── */}
      <g opacity="0.45" fill="#020304">
        <polygon points="198,900 168,588 228,588"/>
        <polygon points="198,662 172,444 224,444"/>
        <polygon points="198,508 176,328 220,328"/>
        <polygon points="198,380 180,240 216,240"/>
        <rect x="190" y="844" width="16" height="56"/>
      </g>
      {/* ── Mid-foreground tall pine ── */}
      <g opacity="0.68" fill="#010303">
        <polygon points="120,900 88,545 152,545"/>
        <polygon points="120,636 96,400 144,400"/>
        <polygon points="120,474 100,298 140,298"/>
        <polygon points="120,344 104,202 136,202"/>
        <polygon points="120,232 108,112 132,112"/>
        <rect x="112" y="834" width="16" height="66"/>
      </g>
      {/* ── Foreground large oak (front-left, bleeds off edge) ── */}
      <g opacity="0.94" fill="#010202">
        {/* Trunk */}
        <path d="M 0,900 C 0,860 4,800 8,750 C 12,700 22,680 20,640 C 18,610 10,590 12,560 C 14,530 26,510 24,480 L 50,480 C 48,510 58,530 56,560 C 54,590 44,610 46,640 C 44,680 54,700 58,750 C 62,800 58,860 58,900 Z"/>
        {/* Big branch right */}
        <path d="M 40,595 C 72,572 118,546 162,528 C 192,516 224,520 246,510"
              stroke="#010202" strokeWidth="28" fill="none" strokeLinecap="round"/>
        {/* Sub-branch from main right */}
        <path d="M 162,528 C 184,508 206,480 216,450 C 224,425 220,400 210,385"
              stroke="#010202" strokeWidth="16" fill="none" strokeLinecap="round"/>
        {/* Branch far right */}
        <path d="M 246,510 C 272,490 294,462 288,432"
              stroke="#010202" strokeWidth="12" fill="none" strokeLinecap="round"/>
        {/* Central upward */}
        <path d="M 34,545 C 38,512 44,472 40,432 C 36,400 28,382 34,352 C 40,326 52,306 48,278"
              stroke="#010202" strokeWidth="22" fill="none" strokeLinecap="round"/>
        {/* Branch left */}
        <path d="M 26,565 C 0,538 -22,510 -34,470 C -44,436 -40,408 -28,388"
              stroke="#010202" strokeWidth="20" fill="none" strokeLinecap="round"/>
        {/* Canopy */}
        <circle cx="42"  cy="228" r="132"/>
        <circle cx="-48" cy="308" r="96"/>
        <circle cx="168" cy="278" r="102"/>
        <circle cx="52"  cy="148" r="102"/>
        <circle cx="-18" cy="228" r="86"/>
        <circle cx="174" cy="210" r="86"/>
        <circle cx="252" cy="308" r="82"/>
        <circle cx="102" cy="168" r="88"/>
        <circle cx="-28" cy="168" r="72"/>
        <circle cx="238" cy="260" r="72"/>
        <circle cx="290" cy="368" r="66"/>
        {/* Hanging branches */}
        <path d="M -68,328 C -90,354 -95,384 -80,400" stroke="#010202" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9"/>
        <path d="M 172,280 C 197,306 202,336 190,352" stroke="#010202" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9"/>
        <path d="M 294,378 C 315,398 320,428 308,440" stroke="#010202" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8"/>
      </g>
    </svg>
  )
}

const VINE_LEAVES: { cx: number; cy: number; rx: number; ry: number; r: number }[] = [
  { cx:35, cy:730, rx:22, ry:10, r:-35 },
  { cx:8,  cy:690, rx:18, ry:8,  r:20  },
  { cx:42, cy:642, rx:25, ry:11, r:-50 },
  { cx:12, cy:598, rx:19, ry:9,  r:15  },
  { cx:48, cy:542, rx:24, ry:11, r:-40 },
  { cx:18, cy:498, rx:20, ry:9,  r:30  },
  { cx:44, cy:442, rx:23, ry:10, r:-55 },
  { cx:15, cy:396, rx:18, ry:8,  r:25  },
  { cx:52, cy:342, rx:26, ry:12, r:-45 },
  { cx:22, cy:296, rx:21, ry:10, r:20  },
  { cx:55, cy:246, rx:24, ry:11, r:-35 },
  { cx:20, cy:202, rx:18, ry:8,  r:40  },
  { cx:60, cy:156, rx:22, ry:10, r:-60 },
  { cx:30, cy:112, rx:20, ry:9,  r:15  },
  { cx:65, cy:62,  rx:23, ry:11, r:-40 },
]

function VineSVG() {
  return (
    <svg viewBox="0 0 150 900" preserveAspectRatio="xMinYMin meet"
      style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Main stem */}
      <path d="M 20,900 C 46,842 6,792 36,732 C 60,678 10,636 42,576 C 66,528 18,486 48,426 C 72,378 22,336 54,276 C 76,232 28,190 60,142 C 80,110 42,70 68,28"
        stroke="#0E2410" strokeWidth="3.5" fill="none" opacity="0.76"/>
      <path d="M 5,858 C 28,808 0,758 26,704 C 48,656 8,614 33,556 C 53,512 14,470 40,414"
        stroke="#0A1C0B" strokeWidth="2" fill="none" opacity="0.48"/>
      <path d="M 62,900 C 82,854 58,814 78,764 C 96,718 68,678 88,626 C 104,584 80,544 100,492"
        stroke="#0B1E0C" strokeWidth="2" fill="none" opacity="0.4"/>
      {/* Leaves */}
      {VINE_LEAVES.map(({ cx, cy, rx, ry, r }, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
          fill={`hsl(${118 + (i % 4) * 4},${30 + (i % 3) * 7}%,${6 + (i % 4) * 1.5}%)`}
          opacity={0.62 + (i % 4) * 0.08}
          transform={`rotate(${r},${cx},${cy})`}
        />
      ))}
      {/* Tendrils */}
      {[730, 642, 542, 442, 342, 246, 156].map((y, i) => (
        <path key={i}
          d={`M${35 + i * 2},${y} C${55 + i * 3},${y + 14} ${60 + i * 3},${y + 28} ${48 + i * 2},${y + 40}`}
          stroke="#0D220E" strokeWidth="1.5" fill="none" opacity="0.36"/>
      ))}
    </svg>
  )
}

function VineLeft() {
  return (
    <div className="hidden lg:block" style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: 'clamp(80px,9vw,145px)',
      pointerEvents: 'none', zIndex: 0, opacity: 0.82,
    }}>
      <VineSVG />
    </div>
  )
}

function VineRight() {
  return (
    <div className="hidden lg:block" style={{
      position: 'fixed', right: 0, top: 0,
      height: '100vh', width: 'clamp(80px,9vw,145px)',
      pointerEvents: 'none', zIndex: 0, opacity: 0.82,
      transform: 'scaleX(-1)',
    }}>
      <VineSVG />
    </div>
  )
}

function ForestBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Sky-to-forest floor gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #04080F 0%, #050910 18%, #05090D 40%, #050908 65%, #040706 100%)',
      }}/>
      {/* Moon glow (pale, behind castle) */}
      <div style={{
        position: 'absolute', left: '50%', top: '4%',
        transform: 'translateX(-50%)',
        width: '60%', height: '48%',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(148,178,232,0.05) 0%, rgba(90,120,180,0.02) 40%, transparent 70%)',
      }}/>
      {/* Castle (centred, upper portion) */}
      <div style={{
        position: 'absolute', left: '50%', top: '16%',
        transform: 'translateX(-50%)',
        width: 'min(360px, 27vw)', opacity: 0.58,
        filter: 'blur(0.4px)',
      }}>
        <CastleSVG />
      </div>
      {/* Trees — left */}
      <div style={{
        position: 'absolute', left: 0, bottom: 0,
        width: 'min(340px, 25vw)', height: '80vh',
      }}>
        <ForestTrees />
      </div>
      {/* Trees — right (mirrored) */}
      <div style={{
        position: 'absolute', right: 0, bottom: 0,
        width: 'min(340px, 25vw)', height: '80vh',
        transform: 'scaleX(-1)',
      }}>
        <ForestTrees />
      </div>
      {/* Ground mist */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to top, rgba(4,8,6,0.78) 0%, rgba(4,8,6,0.28) 50%, transparent 100%)',
      }}/>
      {/* Mid-height atmospheric haze */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '45%', height: '22%',
        background: 'radial-gradient(ellipse 85% 55% at 50% 50%, rgba(16,30,24,0.14) 0%, transparent 100%)',
      }}/>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Landing() {
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [quizStep,     setQuizStep]     = useState<number | 'email'>(1)
  const [answers,      setAnswers]      = useState<{
    budget: string | null; unitSize: string | null; category: string | null
    platform: string | null; goal: string | null
  }>({ budget: null, unitSize: null, category: null, platform: null, goal: null })
  const [email,        setEmail]        = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const answerKeys   = ['budget', 'unitSize', 'category', 'platform', 'goal'] as const
  const currentValue = quizStep === 'email' ? null : answers[answerKeys[(quizStep as number) - 1]]

  const handleSelect = useCallback((val: string) => {
    const key = answerKeys[(quizStep as number) - 1]
    setAnswers(prev => ({ ...prev, [key]: val }))
    setTimeout(() => {
      if ((quizStep as number) < STEPS) setQuizStep(q => (q as number) + 1)
      else setQuizStep('email')
    }, 180)
  }, [quizStep]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (quizStep === 'email') return
    const q = QUIZ_QUESTIONS[(quizStep as number) - 1]
    const handler = (e: KeyboardEvent) => {
      const n = parseInt(e.key)
      if (n >= 1 && n <= q.options.length) handleSelect(q.options[n - 1].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [quizStep, handleSelect])

  const handleEmailSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setEmailTouched(true)
    const valid = email.includes('@') && email.includes('.') && email.length > 5
    if (!valid) return
    setIsSubmitting(true)
    const qa: QuizAnswers = {
      budgetGbp: parseInt(answers.budget  || '375'),
      unitSize:  (answers.unitSize || 'medium') as QuizAnswers['unitSize'],
      category:  answers.category || 'No preference',
      platform:  answers.platform || 'any',
      goal:      (answers.goal || 'safe') as QuizAnswers['goal'],
    }
    saveQuizToStorage(qa)
    if (isAuthenticated) navigate('/dashboard')
    else navigate(`/auth/signup?${new URLSearchParams({ email }).toString()}`)
  }

  const step       = quizStep === 'email' ? STEPS + 1 : (quizStep as number)
  const emailValid = email.includes('@') && email.includes('.') && email.length > 5

  return (
    <div style={{ background: '#04080F', minHeight: '100vh', fontFamily: 'Outfit,sans-serif', color: C.text, position: 'relative', overflow: 'hidden' }}>

      {/* ── Forest background (castle + trees + atmosphere) ──────────── */}
      <ForestBackground />

      {/* ── Vine decorations ─────────────────────────────────────────── */}
      <VineLeft />
      <VineRight />

      {/* ── Global star field ──────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            className="animate-twinkle"
            style={{
              position:  'absolute',
              left:       s.left,
              top:        s.top,
              width:      s.size,
              height:     s.size,
              borderRadius: '50%',
              background: i % 4 === 0 ? C.cyan : i % 3 === 0 ? C.purpleBright : '#fff',
              animationDelay:    s.delay,
              animationDuration: s.dur,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* ── Ambient orbs (fixed, behind everything) ────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Large purple orb — top left */}
        <div className="animate-float-orb" style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          animationDelay: '0s',
        }} />
        {/* Cyan orb — right */}
        <div className="animate-float-orb" style={{
          position: 'absolute', top: '30%', right: '-8%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(50px)',
          animationDelay: '-4s',
        }} />
        {/* Violet orb — bottom center */}
        <div className="animate-float-orb" style={{
          position: 'absolute', bottom: '5%', left: '35%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animationDelay: '-8s',
        }} />
      </div>

      {/* ── All page content sits above z=1 ──────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ─────────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(7,5,17,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 28px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Wordmark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#how-it-works"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, textDecoration: 'none' }}
              className="hidden sm:block hover:text-white transition-colors"
            >
              How it works
            </a>
            <a href="#pricing"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, textDecoration: 'none' }}
              className="hidden sm:block hover:text-white transition-colors"
            >
              Pricing
            </a>
            <Link to="/auth/signin"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, textDecoration: 'none' }}
              className="hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link to="/auth/signup" style={{
              fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
              color: '#fff', background: GBTN,
              padding: '7px 16px', borderRadius: 7, textDecoration: 'none',
              boxShadow: '0 0 14px rgba(124,58,237,0.35)',
            }}>
              Start free
            </Link>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section style={{
          paddingTop:    76,
          paddingBottom: 72,
          paddingLeft:   24,
          paddingRight:  24,
          minHeight:     '100vh',
          display:       'flex',
          alignItems:    'center',
        }}>
          <div
            className="flex flex-col lg:flex-row items-center"
            style={{ maxWidth: 1160, width: '100%', margin: '0 auto', gap: 48 }}
          >

            {/* ── Left: text column ── */}
            <div
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
              style={{ flex: '1 1 420px', minWidth: 0 }}
            >
              {/* Badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: '"DM Mono",monospace', fontSize: 11, letterSpacing: '0.06em',
                color: C.purpleBright,
                background: 'rgba(139,92,246,0.08)', border: `1px solid ${C.border}`,
                padding: '6px 16px', borderRadius: 9999,
                marginBottom: 28,
              }}>
                <span className="animate-pulse-glow" style={{
                  width: 6, height: 6, borderRadius: '50%', background: C.purple,
                  display: 'inline-block', flexShrink: 0,
                  boxShadow: `0 0 8px ${C.purple}`,
                }} />
                1,200+ ENTREPRENEURS · TRUSTED WORLDWIDE
              </span>

              {/* Headline */}
              <h1 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
                fontWeight:    700,
                textTransform: 'uppercase',
                fontSize:      'clamp(44px,6vw,84px)',
                lineHeight:    0.93,
                letterSpacing: '-0.01em',
                color:         C.text,
                marginBottom:  24,
              }}>
                Find Winning<br />
                Products<br />
                <span style={GTEXT}>Using ✦ Sorcery</span>
              </h1>

              {/* Subheading */}
              <p style={{
                fontFamily: 'Outfit,sans-serif', fontSize: 16, color: C.textDim,
                lineHeight: 1.7, maxWidth: 480, marginBottom: 36,
              }}>
                Answer five questions. Our AI scries 1,000+ products across Temu, AliExpress and Alibaba — then calculates your exact margin on Amazon, eBay, Etsy and Shopify. Under 30 seconds.
              </p>

              {/* Stats */}
              <div
                className="flex flex-wrap justify-center lg:justify-start"
                style={{ gap: '8px 36px' }}
              >
                {([
                  { v: '1,200+', l: 'Entrepreneurs' },
                  { v: '30s',    l: 'Avg. report time' },
                  { v: '4',      l: 'Platforms covered' },
                  { v: '£10',    l: 'Pro per month' },
                ] as const).map(({ v, l }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <p style={{ ...GTEXT, fontFamily: '"DM Mono",monospace', fontSize: 24, lineHeight: 1, margin: 0 }}>{v}</p>
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, margin: '4px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Quiz card (THE BIG THING) ── */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 500 }}>
              <div style={{
                ...GLASS,
                borderRadius: 20,
                boxShadow: '0 0 0 1px rgba(139,92,246,0.12), 0 32px 80px rgba(0,0,0,0.75), 0 0 80px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.05)',
                border: `1px solid ${C.borderGlow}`,
              }}>
                {/* Card header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 22px',
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles style={{ width: 14, height: 14, color: C.purpleBright }} />
                    <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.10em', color: C.textMuted, textTransform: 'uppercase' }}>
                      Configure Your Spell
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[C.textMuted, C.textMuted, C.textMuted].map((c, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? C.purple : c, opacity: i === 0 ? 1 : 0.25 }} />
                    ))}
                  </div>
                </div>

                <div style={{ padding: 22 }}>
                  {quizStep !== 'email' ? (
                    <div key={`step-${quizStep}`} className="animate-fadeIn">
                      <QuizProgress step={step} total={STEPS} />
                      <p style={{
                        fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15,
                        color: C.text, margin: '0 0 14px',
                      }}>
                        {QUIZ_QUESTIONS[(quizStep as number) - 1].title}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {QUIZ_QUESTIONS[(quizStep as number) - 1].options.map(opt => (
                          <QuizOpt
                            key={opt.id} option={opt}
                            selected={currentValue === opt.id}
                            onClick={() => handleSelect(opt.id)}
                          />
                        ))}
                      </div>
                      {(quizStep as number) > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizStep((quizStep as number) - 1)}
                          style={{
                            marginTop: 14, display: 'flex', alignItems: 'center', gap: 4,
                            fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted,
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          }}
                        >
                          <ChevronLeft style={{ width: 13, height: 13 }} />
                          Back
                        </button>
                      )}
                    </div>
                  ) : (
                    <form key="email" onSubmit={handleEmailSubmit} className="animate-fadeIn">
                      <QuizProgress step={step} total={STEPS} />
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: C.text, margin: '0 0 4px' }}>
                        Almost done ✦
                      </p>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, margin: '0 0 18px' }}>
                        Where shall we send your oracle?
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.text,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${emailTouched && !emailValid ? '#EF4444' : C.border}`,
                          borderRadius: 10, padding: '11px 14px',
                          outline: 'none', transition: 'border-color 150ms',
                          marginBottom: emailTouched && !emailValid ? 4 : 0,
                        }}
                        onFocus={e  => { e.target.style.borderColor = C.borderGlow; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)' }}
                        onBlur={e   => { e.target.style.borderColor = emailTouched && !emailValid ? '#EF4444' : C.border; e.target.style.boxShadow = 'none' }}
                      />
                      {emailTouched && !emailValid && (
                        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#EF4444', margin: '0 0 4px' }}>
                          Please enter a valid email address.
                        </p>
                      )}
                      <div style={{ height: 14 }} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff',
                          background: GBTN, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: isSubmitting ? 'default' : 'pointer',
                          opacity: isSubmitting ? 0.65 : 1, transition: 'all 200ms',
                          boxShadow: isSubmitting ? 'none' : '0 0 24px rgba(124,58,237,0.45), 0 4px 16px rgba(0,0,0,0.4)',
                        }}
                      >
                        {isSubmitting
                          ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                          : <><span>✦ Reveal My Fortune</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
                      </button>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 10 }}>
                        2 free reports · No credit card required
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuizStep(STEPS)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          margin: '8px auto 0',
                          fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted,
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                      >
                        <ChevronLeft style={{ width: 12, height: 12 }} />
                        Back
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Trust strip ────────────────────────────────────────────── */}
        <div style={{
          borderTop:    `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: '14px 24px',
          background: 'rgba(14,10,28,0.5)',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 28px' }}>
            {[
              'Temu · AliExpress · Alibaba',
              'Amazon · eBay · Etsy · Shopify',
              'AI analysis in under 30 seconds',
              'No credit card to start',
            ].map(t => (
              <span key={t} style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted }}>
                <span style={{ color: C.purpleBright, marginRight: 6 }}>✦</span>{t}
              </span>
            ))}
          </div>
        </div>

        {/* ── How it works ───────────────────────────────────────────── */}
        <section id="how-it-works" style={{ padding: '96px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE PROCESS
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97,
                margin: '0 auto 16px', maxWidth: 500,
              }}>
                <span style={{ color: C.text }}>The Art</span>{' '}
                <span style={GTEXT}>of Sourcing</span>
              </h2>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: C.textDim, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
                No spreadsheets. No hours of research. Three steps from intent to fortune.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
              {HOW_STEPS.map(({ n, icon: Icon, title, desc }, idx) => (
                <div key={n} style={{ ...GLASS, padding: 28, position: 'relative', overflow: 'hidden' }}>
                  {/* Decorative number */}
                  <div style={{
                    position: 'absolute', top: -16, right: 20,
                    fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
                    fontWeight: 700, fontSize: 80, lineHeight: 1,
                    ...GTEXT, opacity: 0.07,
                  }}>{n}</div>

                  <div style={{
                    display: 'inline-flex', padding: 10, borderRadius: 10, marginBottom: 18,
                    background: 'rgba(139,92,246,0.08)', border: `1px solid ${C.border}`,
                    boxShadow: '0 0 12px rgba(139,92,246,0.10)',
                  }}>
                    <Icon style={{ width: 18, height: 18, color: C.purpleBright }} />
                  </div>

                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 10 }}>{title}</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72 }}>{desc}</p>

                  {idx < 2 && (
                    <div style={{
                      position: 'absolute', top: '50%', right: -18,
                      color: C.textMuted, fontSize: 12,
                      display: 'none', // hidden on mobile via CSS; visible on md+
                    }}>
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── Sample report ──────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE ORACLE
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: '0 auto 16px',
              }}>
                <span style={{ color: C.text }}>What the Oracle</span>{' '}
                <span style={GTEXT}>Reveals</span>
              </h2>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: C.textDim, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
                Real data, not generic advice. Every report is conjured fresh from live marketplace listings.
              </p>
            </div>

            <div style={{ ...GLASS, maxWidth: 680, margin: '0 auto', padding: 28,
              boxShadow: '0 0 0 1px rgba(139,92,246,0.10), 0 30px 60px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.06)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 5 }}>
                    Home &amp; Gadgets
                  </p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 17, color: C.text }}>
                    Portable LED Ring Light
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Badge label="OPP"  value="8.4" />
                  <Badge label="RISK" value="3.1" risk />
                </div>
              </div>

              {/* Metric tiles */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <Tile label="Buy price"  value="$2.40"  sub="Temu · MOQ 50" />
                <Tile label="Avg. sell"  value="$24.99" sub="Amazon" />
                <Tile label="Net margin" value="58%"    sub="After all fees" accent />
              </div>

              {/* Sparkline */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    12-week search trend
                  </p>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.cyan }}>+31%</p>
                </div>
                <Sparkline />
              </div>

              {/* Platform bars */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Platform opportunity
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PlatBar name="Amazon" pct={82} />
                  <PlatBar name="eBay"   pct={71} />
                  <PlatBar name="Etsy"   pct={58} />
                </div>
              </div>

              {/* AI analysis — partial reveal */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ padding: 6, borderRadius: 6, background: 'rgba(139,92,246,0.10)', border: `1px solid ${C.border}` }}>
                    <Sparkles style={{ width: 12, height: 12, color: C.purpleBright }} />
                  </div>
                  <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    AI Analysis
                  </span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 9, fontWeight: 600, color: C.purpleBright, background: 'rgba(139,92,246,0.09)', padding: '2px 8px', borderRadius: 9999, border: `1px solid ${C.border}` }}>
                    Pro · GPT-4o
                  </span>
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72, marginBottom: 12 }}>
                  The portable LED ring light is a compelling opportunity in the creator economy segment. Demand has grown 31% over six months, driven by the rise of short-form video content on TikTok and Instagram Reels…
                </p>
                <div style={{ filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72 }}>
                    The primary risk is moderate market saturation — approximately 4,200 competing listings on Amazon. Differentiation through bundle offers and premium packaging can command a 15–20% price premium over generic competitors.
                  </p>
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: `linear-gradient(to bottom, transparent 10%, rgba(14,10,28,0.97) 65%)`,
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
                  top: '52%',
                }}>
                  <Link to="/pricing" style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12, color: C.purpleBright,
                    background: 'rgba(14,10,28,0.9)', border: `1px solid ${C.border}`,
                    padding: '7px 18px', borderRadius: 9999, textDecoration: 'none',
                    boxShadow: '0 0 12px rgba(139,92,246,0.15)',
                  }}>
                    ✦ Unlock full analysis with Pro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── Features ───────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE ARSENAL
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: '0 auto',
              }}>
                <span style={GTEXT}>Everything</span>{' '}
                <span style={{ color: C.text }}>in One Report</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{
                  ...GLASS, padding: 24,
                  transition: 'border-color 250ms, box-shadow 250ms',
                }}>
                  <div style={{
                    display: 'inline-flex', padding: 10, borderRadius: 10, marginBottom: 16,
                    background: 'rgba(139,92,246,0.07)', border: `1px solid ${C.border}`,
                  }}>
                    <Icon style={{ width: 16, height: 16, color: C.purpleBright }} />
                  </div>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 8 }}>{title}</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── Pricing ────────────────────────────────────────────────── */}
        <section id="pricing" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                PRICING
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: '0 auto 16px',
              }}>
                <span style={{ color: C.text }}>Choose Your</span>{' '}
                <span style={GTEXT}>Power</span>
              </h2>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: C.textDim, maxWidth: 340, margin: '0 auto', lineHeight: 1.7 }}>
                Two free ideas to prove the value. Then £10 a month for everything.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>

              {/* Free */}
              <div style={{ ...GLASS, padding: 32 }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.12em', color: C.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Apprentice
                </p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, color: C.text, lineHeight: 1 }}>£0</span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.textMuted, marginLeft: 4 }}>/forever</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['2 free ideas (lifetime)', '1-paragraph AI summary', 'Margin calculator', 'Best platform only'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim }}>
                      <Check style={{ width: 14, height: 14, color: C.purple, flexShrink: 0 }} />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/signup" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: C.textDim,
                  border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 20px',
                  transition: 'border-color 200ms, color 200ms',
                }}>
                  Get started free
                </Link>
              </div>

              {/* Pro */}
              <div style={{
                ...GLASS,
                padding: 32, position: 'relative', overflow: 'hidden',
                border: `1px solid ${C.borderGlow}`,
                boxShadow: `0 0 0 1px rgba(139,92,246,0.10), 0 24px 60px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}>
                {/* Inner purple gradient glow at top */}
                <div style={{
                  position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                  width: 300, height: 120,
                  background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'absolute', top: 14, right: 14 }}>
                  <span style={{
                    fontFamily: '"DM Mono",monospace', fontWeight: 700, fontSize: 9, letterSpacing: '0.08em',
                    color: '#fff', background: GBTN,
                    padding: '4px 10px', borderRadius: 9999,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 0 10px rgba(124,58,237,0.4)',
                  }}>
                    <Sparkles style={{ width: 9, height: 9 }} />MOST POPULAR
                  </span>
                </div>

                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.12em', color: C.purpleBright, textTransform: 'uppercase', marginBottom: 8 }}>
                  Sorcerer
                </p>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ ...GTEXT, fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, lineHeight: 1 }}>£10</span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.textDim, marginLeft: 4 }}>/month</span>
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted, marginBottom: 24 }}>Less than £0.35 per idea</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    '20 fresh ideas per week',
                    'Full 5-paragraph GPT-4o analysis',
                    'All 4 platform comparisons',
                    'Trend charts & 6-month data',
                    'Interactive margin calculator',
                    'Full report history',
                  ].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.text }}>
                      <Check style={{ width: 14, height: 14, color: C.purpleBright, flexShrink: 0 }} />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                  color: '#fff', background: GBTN, borderRadius: 9, padding: '12px 20px',
                  boxShadow: '0 0 20px rgba(124,58,237,0.40), 0 4px 14px rgba(0,0,0,0.4)',
                }}>
                  ✦ Subscribe — £10/mo
                </Link>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 10 }}>Cancel anytime</p>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/pricing"
                style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                See full feature comparison →
              </Link>
            </p>
          </div>
        </section>

        <MagicDivider />

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
              textTransform: 'uppercase', fontSize: 'clamp(28px,4vw,46px)',
              letterSpacing: '-0.01em', color: C.text, textAlign: 'center', marginBottom: 48,
            }}>
              Common Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { q: 'How accurate is the data?',
                  a: 'Our product database is refreshed from real marketplace listings regularly. Buy prices come directly from Temu, AliExpress and Alibaba. Sell-side estimates are based on completed listings and sales rank data from Amazon, eBay, and Etsy.' },
                { q: "What's the difference between free and Pro?",
                  a: 'Free gives you 2 lifetime ideas with a short 1-paragraph summary and your best platform only. Pro gives you 20 ideas every week with a full 5-paragraph GPT-4o report, all 4 platform comparisons, and 6-month trend charts.' },
                { q: 'How is this different from just searching Google?',
                  a: "We pull buy-side and sell-side data simultaneously, calculate your actual margin after all fees and shipping, show you 6 months of trend data, and generate a written analysis — all in under 30 seconds. Google can't tell you your margin on a specific product." },
                { q: 'Can I cancel Pro anytime?',
                  a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month. No questions asked.' },
                { q: 'What platforms do you cover?',
                  a: 'Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. We show margins, fees, and estimated monthly sales on each.' },
              ].map(({ q, a }) => (
                <details key={q} className="group" style={{ ...GLASS, borderRadius: 10 }}>
                  <summary style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: C.text,
                    padding: '14px 18px', cursor: 'pointer', listStyle: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    {q}
                    <span style={{ color: C.textMuted, flexShrink: 0, marginLeft: 12 }} className="group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72, padding: '0 18px 14px' }}>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────── */}
        <section style={{ padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Big glow backdrop */}
          <div className="animate-pulse-glow" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600, height: 400,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.20) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            {/* Large logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <Logo size={64} />
            </div>
            <h2 style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
              textTransform: 'uppercase', fontSize: 'clamp(40px,6vw,68px)', lineHeight: 0.95,
              letterSpacing: '-0.01em', marginBottom: 20,
            }}>
              <span style={{ color: C.text }}>Ready to Work</span><br />
              <span style={GTEXT}>Your Magic?</span>
            </h2>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, color: C.textDim, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Join 1,200+ entrepreneurs finding profitable products with Sourcery. Start free — no credit card, no ritual sacrifice required.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              <a
                href="#"
                onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 15,
                  color: '#fff', background: GBTN, textDecoration: 'none',
                  padding: '14px 36px', borderRadius: 10,
                  boxShadow: '0 0 32px rgba(124,58,237,0.50), 0 4px 20px rgba(0,0,0,0.5)',
                  border: `1px solid ${C.borderGlow}`,
                }}
              >
                ✦ Start for free
                <ArrowRight style={{ width: 17, height: 17 }} />
              </a>
              <Link to="/pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.textDim, textDecoration: 'none',
              }} className="hover:text-white transition-colors">
                See Pro features →
              </Link>
            </div>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: C.textMuted, marginTop: 22, letterSpacing: '0.06em' }}>
              2 FREE IDEAS · NO CREDIT CARD · 60 SECONDS
            </p>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer style={{
          borderTop:   `1px solid ${C.border}`,
          padding:     '20px 28px',
          background:  'rgba(7,5,17,0.95)',
          display:     'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <Wordmark size="sm" />
          <div style={{ display: 'flex', gap: 20 }}>
            {([
              { label: 'How it works', href: '#how-it-works', isAnchor: true  },
              { label: 'Pricing',      href: '/pricing',      isAnchor: false },
              { label: 'Sign in',      href: '/auth/signin',  isAnchor: false },
              { label: 'Sign up',      href: '/auth/signup',  isAnchor: false },
            ] as const).map(({ label, href, isAnchor }) =>
              isAnchor
                ? <a   key={label} href={href}  style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted, textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
                : <Link key={label} to={href}   style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted, textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</Link>
            )}
          </div>
          <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.textMuted, letterSpacing: '0.06em' }}>
            © {new Date().getFullYear()} SOURCERY
          </p>
        </footer>

      </div>{/* /z-1 wrapper */}
    </div>
  )
}
