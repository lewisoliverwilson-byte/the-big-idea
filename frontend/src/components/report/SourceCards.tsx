import { Product, SourcePlatform } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { ExternalLink } from 'lucide-react'

interface SourceCardsProps {
  product: Product
}

const PLATFORM_NAMES: Record<SourcePlatform, string> = {
  temu:       'Temu',
  aliexpress: 'AliExpress',
  alibaba:    'Alibaba',
}

const PLATFORM_COLORS: Record<SourcePlatform, string> = {
  temu:       '#F97316',
  aliexpress: '#EF4444',
  alibaba:    '#EA580C',
}

const C = {
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
  border:  'rgba(139,92,246,0.15)',
}
const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'

export function SourceCards({ product }: SourceCardsProps) {
  const platformColor = PLATFORM_COLORS[product.sourcePlatform] || '#8B5CF6'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

      {/* Primary source card */}
      <div style={{
        background:   'rgba(139,92,246,0.08)',
        border:       '1px solid rgba(139,92,246,0.3)',
        borderRadius: 16,
        padding:      '20px',
        position:     'relative',
      }}>
        {/* Best Value tag */}
        <div style={{
          position:   'absolute',
          top:        -10,
          left:       16,
          background: GBTN,
          borderRadius: 99,
          padding:    '3px 12px',
          fontSize:   10,
          fontWeight: 700,
          color:      '#fff',
          border:     '1px solid rgba(139,92,246,0.4)',
        }}>
          ✦ Best Value
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 6 }}>
          <div style={{
            width:          34,
            height:         34,
            borderRadius:   10,
            background:     platformColor,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       14,
            fontWeight:     700,
            color:          '#fff',
            flexShrink:     0,
          }}>
            {PLATFORM_NAMES[product.sourcePlatform][0]}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {PLATFORM_NAMES[product.sourcePlatform]}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          {[
            { label: 'Unit price',    value: formatCurrency(product.sourcePriceUsd),          highlight: true  },
            { label: 'Min. order',    value: `${product.sourceMinOrderQty} units`,             highlight: false },
            { label: 'Shipping est.', value: formatCurrency(product.sourceShippingEstimateUsd), highlight: false },
            { label: 'Delivery time', value: '7–14 days',                                      highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.textDim }}>{label}</span>
              <span style={{ fontWeight: 600, color: highlight ? '#34D399' : C.text }}>{value}</span>
            </div>
          ))}
        </div>

        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop:      16,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            6,
            width:          '100%',
            padding:        '10px',
            background:     GBTN,
            border:         '1px solid rgba(139,92,246,0.4)',
            borderRadius:   10,
            color:          '#fff',
            fontSize:       13,
            fontWeight:     600,
            textDecoration: 'none',
            boxSizing:      'border-box',
          }}
        >
          View listing
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Alternative sources note */}
      <div style={{
        background:   'rgba(14,10,28,0.6)',
        border:       `1px dashed ${C.border}`,
        borderRadius: 16,
        padding:      '20px',
        display:      'flex',
        alignItems:   'center',
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>
            💡 Also check these platforms
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                label: `Search AliExpress for "${product.name.slice(0, 30)}${product.name.length > 30 ? '…' : ''}"`,
                href:  `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.name)}`,
              },
              {
                label: 'Search Alibaba wholesale',
                href:  `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(product.name)}`,
              },
              {
                label: 'Search Temu',
                href:  `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(product.name)}`,
              },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#A78BFA', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
