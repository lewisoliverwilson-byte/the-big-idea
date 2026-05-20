import { PlatformComparison } from '../../types'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'

interface PlatformTableProps {
  platforms: PlatformComparison[]
}

const PLATFORM_LINKS: Record<string, string> = {
  amazon: 'https://sellercentral.amazon.co.uk',
  ebay: 'https://www.ebay.co.uk/sell',
  etsy: 'https://www.etsy.com/uk/sell',
  shopify: 'https://www.shopify.com/uk',
}

const PLATFORM_COLORS: Record<string, string> = {
  amazon: 'bg-orange-50 border-orange-200',
  ebay: 'bg-blue-50 border-blue-200',
  etsy: 'bg-orange-50 border-orange-100',
  shopify: 'bg-green-50 border-green-200',
}

export function PlatformTable({ platforms }: PlatformTableProps) {
  const difficultyVariant = (d: string): 'green' | 'amber' | 'red' => {
    if (d === 'Low') return 'green'
    if (d === 'Medium') return 'amber'
    return 'red'
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Platform Comparison</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Where you can sell this product and what margins to expect
        </p>
      </CardHeader>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-6 font-semibold text-gray-600">Platform</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Avg. Sell Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Fee</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Net Margin</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Est. Sales/mo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Difficulty</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr
                  key={p.platform}
                  className={`border-b border-gray-100 last:border-0 ${
                    p.recommended ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium text-gray-900">
                        {p.platform}
                      </span>
                      {p.recommended && (
                        <Badge variant="blue" size="sm">Recommended</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(p.estimatedSellPrice)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {p.feePercent}%
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-semibold ${
                        p.netMargin >= 20
                          ? 'text-green-600'
                          : p.netMargin >= 10
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {p.netMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-700">
                    ~{p.estimatedMonthlySales}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge variant={difficultyVariant(p.difficulty)} size="sm">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={PLATFORM_LINKS[p.platform]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      Start selling →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}
