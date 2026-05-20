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
import { Card, CardBody, CardHeader } from '../ui/Card'

interface ChartsProps {
  trendData: TrendDataPoint[]
  productName: string
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

  return (
    <div className="space-y-6">
      {/* Search Volume Trend */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Search Volume Trend — Last 12 Months</h3>
          <p className="text-sm text-gray-500 mt-0.5">Relative search interest for "{productName}"</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={searchVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="Search Volume"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Sales Velocity */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Sales Velocity — Last 6 Months</h3>
          <p className="text-sm text-gray-500 mt-0.5">Estimated monthly sales index</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Monthly Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  )
}
