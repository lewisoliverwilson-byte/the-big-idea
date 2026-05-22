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
  text:    '#0F172A',
  textSec: '#475569',
  textMut: '#94A3B8',
  border:  '#E2E8F0',
  primary: '#4F46E5',
}

const CHART_SECTION = {
  background:   '#F8FAFC',
  border:       `1px solid ${C.border}`,
  borderRadius: 10,
  padding:      '18px 18px 14px',
  marginBottom: 12,
}

function LightTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   '#FFFFFF',
      border:       '1px solid #E2E8F0',
      borderRadius: 8,
      padding:      '8px 12px',
      fontSize:     12,
      boxShadow:    '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ color: C.textSec, marginBottom: 4 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color || C.primary, fontWeight: 700 }}>
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
      <div style={CHART_SECTION}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Search Volume Trend — Last 12 Months
        </h3>
        <p style={{ fontSize: 12, color: C.textSec, marginBottom: 14, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Relative search interest for "{productName}"
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={searchVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<LightTooltip />} />
            <Line
              type="monotone"
              dataKey="Search Volume"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#6366F1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales Velocity */}
      <div style={{ ...CHART_SECTION, marginBottom: 0 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Sales Velocity — Last 6 Months
        </h3>
        <p style={{ fontSize: 12, color: C.textSec, marginBottom: 14, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Estimated monthly sales index
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<LightTooltip />} />
            <Bar
              dataKey="Monthly Sales"
              fill="url(#barGrad)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366F1" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
