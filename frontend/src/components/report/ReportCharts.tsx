import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendDataPoint } from '../../types'

interface ChartsProps {
  trendData:   TrendDataPoint[]
  productName: string
}

const C = {
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
  border:  'rgba(139,92,246,0.12)',
}

const GLASS_SECTION = {
  background:    'rgba(14,10,28,0.5)',
  border:        '1px solid rgba(139,92,246,0.15)',
  borderRadius:  16,
  padding:       '20px 20px 16px',
  marginBottom:  16,
}

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   'rgba(14,10,28,0.95)',
      border:       '1px solid rgba(139,92,246,0.3)',
      borderRadius: 10,
      padding:      '10px 14px',
      fontSize:     12,
    }}>
      <p style={{ color: C.textDim, marginBottom: 4 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color || '#A78BFA', fontWeight: 700 }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export function ReportCharts({ trendData, productName }: ChartsProps) {
  const searchVolumeData = trendData.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    'Search Volume': d.searchVolume,
  }))

  const salesData = trendData.slice(-6).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    'Monthly Sales': d.salesIndex,
  }))

  const tickStyle = { fill: C.textMut, fontSize: 11 }

  return (
    <div>
      {/* Search Volume Trend */}
      <div style={GLASS_SECTION}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
          Search Volume Trend — Last 12 Months
        </h3>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 16 }}>
          Relative search interest for "{productName}"
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={searchVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
            <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} />
            <Line
              type="monotone"
              dataKey="Search Volume"
              stroke="#A78BFA"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#C084FC' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales Velocity */}
      <div style={{ ...GLASS_SECTION, marginBottom: 0 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
          Sales Velocity — Last 6 Months
        </h3>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 16 }}>
          Estimated monthly sales index
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
            <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} />
            <Bar
              dataKey="Monthly Sales"
              fill="url(#barGrad)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C084FC" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
