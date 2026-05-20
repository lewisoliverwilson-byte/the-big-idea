import { Product, SourcePlatform } from '../../types'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'
import { ExternalLink } from 'lucide-react'

interface SourceCardsProps {
  product: Product
}

const PLATFORM_NAMES: Record<SourcePlatform, string> = {
  temu: 'Temu',
  aliexpress: 'AliExpress',
  alibaba: 'Alibaba',
}

const PLATFORM_COLORS: Record<SourcePlatform, string> = {
  temu: 'bg-orange-500',
  aliexpress: 'bg-red-500',
  alibaba: 'bg-orange-600',
}

export function SourceCards({ product }: SourceCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Primary source card */}
        <Card className="border-2 border-indigo-200 relative">
          <Badge variant="blue" className="absolute -top-2.5 left-4 text-xs">
            Best Value
          </Badge>
          <CardBody className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-8 h-8 rounded-lg ${PLATFORM_COLORS[product.sourcePlatform]} flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">
                  {PLATFORM_NAMES[product.sourcePlatform][0]}
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {PLATFORM_NAMES[product.sourcePlatform]}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Unit price</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(product.sourcePriceUsd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Min. order</span>
                <span className="font-medium">{product.sourceMinOrderQty} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping est.</span>
                <span className="font-medium">
                  {formatCurrency(product.sourceShippingEstimateUsd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery time</span>
                <span className="font-medium">7–14 days</span>
              </div>
            </div>

            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View listing
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardBody>
        </Card>

        {/* Alternative source note */}
        <div className="sm:col-span-1 lg:col-span-2 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4 flex items-center">
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">💡 Also check these platforms</p>
            <ul className="space-y-1">
              <li>
                <a
                  href={`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Search AliExpress for "{product.name.slice(0, 40)}"
                </a>
              </li>
              <li>
                <a
                  href={`https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Search Alibaba wholesale
                </a>
              </li>
              <li>
                <a
                  href={`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Search Temu
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
