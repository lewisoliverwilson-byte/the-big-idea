import { PlatformComparison } from '../../types'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'

interface PlatformTableProps {
  platforms: PlatformComparison[]
}

const PLATFORM_LINKS: Record<string, string> = {
  amazon:  'https://sellercentral.amazon.co.uk',
  ebay:    'https://www.ebay.co.uk/sell',
  etsy:    'https://www.etsy.com/uk/sell',
  shopify: 'https://www.shopify.com/uk',
}

const C = {
  text:    '#0F172A',
  textSec: '#475569',
  textMut: '#94A3B8',
  border:  '#E2E8F0',
  primary: '#4F46E5',
}

export function PlatformTable({ platforms }: PlatformTableProps) {
  const difficultyVariant = (d: string): 'green' | 'amber' | 'red' =>
    d === 'Low' ? 'green' : d === 'Medium' ? 'amber' : 'red'

  return (
    <div style={{ overflowX: 'auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {['Platform', 'Avg. Sell Price', 'Fee', 'Net Margin', 'Est. Sales/mo', 'Difficulty', ''].map((h) => (
              <th key={h} style={{
                padding:       '10px 14px',
                textAlign:     h === 'Platform' || h === '' ? 'left' : 'right',
                fontSize:      11,
                fontWeight:    700,
                color:         C.textMut,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                whiteSpace:    'nowrap',
                background:    '#FAFAFA',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {platforms.map((p) => (
            <tr
              key={p.platform}
              style={{
                borderBottom: `1px solid ${C.border}`,
                background:   p.recommended ? '#EEF2FF' : 'transparent',
                transition:   'background 0.12s',
              }}
            >
              <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: C.text, textTransform: 'capitalize' }}>
                    {p.platform}
                  </span>
                  {p.recommended && <Badge variant="blue" size="sm">Best pick</Badge>}
                </div>
              </td>
              <td style={{ padding: '14px', textAlign: 'right', fontWeight: 600, color: C.text }}>
                {formatCurrency(p.estimatedSellPrice)}
              </td>
              <td style={{ padding: '14px', textAlign: 'right', color: C.textSec }}>
                {p.feePercent}%
              </td>
              <td style={{ padding: '14px', textAlign: 'right' }}>
                <span style={{
                  fontWeight: 700,
                  color: p.netMargin >= 20 ? '#059669' : p.netMargin >= 10 ? '#D97706' : '#DC2626',
                }}>
                  {p.netMargin.toFixed(1)}%
                </span>
              </td>
              <td style={{ padding: '14px', textAlign: 'right', color: C.textSec }}>
                ~{p.estimatedMonthlySales}
              </td>
              <td style={{ padding: '14px', textAlign: 'right' }}>
                <Badge variant={difficultyVariant(p.difficulty)} size="sm">
                  {p.difficulty}
                </Badge>
              </td>
              <td style={{ padding: '14px' }}>
                <a
                  href={PLATFORM_LINKS[p.platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: C.primary, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Start selling →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
