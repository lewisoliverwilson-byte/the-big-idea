import { useState } from 'react'
import { MarginAnalysis } from '../../types'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { formatCurrency } from '../../utils/formatters'

interface MarginCalculatorProps {
  margin: MarginAnalysis
}

export function MarginCalculator({ margin }: MarginCalculatorProps) {
  const [sellPrice, setSellPrice] = useState(margin.estimatedSellPriceUsd)

  const platformFee = sellPrice * (margin.platformFeePercent / 100)
  const profit = sellPrice - margin.sourcePriceUsd - margin.shippingToUkUsd - platformFee
  const profitPercent = sellPrice > 0 ? (profit / sellPrice) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Margin Calculator</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Adjust your sell price to see live profit estimates
        </p>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Cost Breakdown
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Source price', value: margin.sourcePriceUsd },
                { label: 'Shipping to UK/US', value: margin.shippingToUkUsd },
                {
                  label: `Platform fee (${margin.platformFeePercent}%)`,
                  value: platformFee,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-red-600">
                    − {formatCurrency(value)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                <span className="text-gray-600">Your sell price</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-20 text-right border border-gray-300 rounded px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    step={0.01}
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profit Summary */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Profit Summary
            </h4>

            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-sm text-indigo-700 font-medium">
                Estimated profit per unit
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(profit)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {profitPercent.toFixed(1)}% margin
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: '50 units', profit: profit * 50 },
                { label: '100 units', profit: profit * 100 },
                { label: '200 units', profit: profit * 200 },
              ].map(({ label, profit: p }) => (
                <div
                  key={label}
                  className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-gray-600">
                    Profit at {label}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      p >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(p)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600">Break-even sell price</span>
              <span className="font-semibold text-amber-700">
                {formatCurrency(margin.minimumViableSellPrice)}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
