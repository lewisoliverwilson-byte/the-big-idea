import { useState } from 'react'
import { MarginAnalysis } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface MarginCalculatorProps {
  margin: MarginAnalysis
}

const C = {
  text:    '#0F172A',
  textSec: '#475569',
  textMut: '#94A3B8',
  border:  '#E2E8F0',
  primary: '#4F46E5',
}

export function MarginCalculator({ margin }: MarginCalculatorProps) {
  const [sellPrice, setSellPrice] = useState(margin.estimatedSellPriceUsd)

  const platformFee    = sellPrice * (margin.platformFeePercent / 100)
  const profit         = sellPrice - margin.sourcePriceUsd - margin.shippingToUkUsd - platformFee
  const profitPercent  = sellPrice > 0 ? (profit / sellPrice) * 100 : 0
  const isPositive     = profit >= 0

  const inputStyle = {
    width:        80,
    textAlign:    'right' as const,
    background:   '#FFFFFF',
    border:       `1px solid ${C.border}`,
    borderRadius: 6,
    padding:      '4px 8px',
    color:        C.text,
    fontSize:     13,
    fontWeight:   600,
    outline:      'none',
    fontFamily:   'Inter, system-ui, sans-serif',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Cost Breakdown */}
      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Cost Breakdown
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Source price',                                  value: margin.sourcePriceUsd },
            { label: 'Shipping estimate',                             value: margin.shippingToUkUsd },
            { label: `Platform fee (${margin.platformFeePercent}%)`,  value: platformFee },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: '#DC2626', fontWeight: 600 }}>− {formatCurrency(value)}</span>
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: C.textSec }}>Your sell price</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: C.textSec, fontSize: 12 }}>$</span>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                style={inputStyle}
                step={0.01}
                min={0}
                onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profit Summary */}
      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Profit Summary
        </h4>

        <div style={{
          background:   isPositive ? '#ECFDF5' : '#FEF2F2',
          border:       `1px solid ${isPositive ? '#A7F3D0' : '#FECACA'}`,
          borderRadius: 10,
          padding:      '16px',
          textAlign:    'center',
          marginBottom: 14,
        }}>
          <p style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>Estimated profit per unit</p>
          <p style={{ fontSize: 30, fontWeight: 700, color: isPositive ? '#059669' : '#DC2626', lineHeight: 1 }}>
            {formatCurrency(profit)}
          </p>
          <p style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
            {profitPercent.toFixed(1)}% margin
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '50 units',  p: profit * 50  },
            { label: '100 units', p: profit * 100 },
            { label: '200 units', p: profit * 200 },
          ].map(({ label, p }) => (
            <div key={label} style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              background:     '#F8FAFC',
              border:         `1px solid ${C.border}`,
              borderRadius:   8,
              padding:        '8px 12px',
              fontSize:       13,
            }}>
              <span style={{ color: C.textSec }}>Profit at {label}</span>
              <span style={{ fontWeight: 700, color: p >= 0 ? '#059669' : '#DC2626' }}>
                {formatCurrency(p)}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 12, borderTop: `1px solid ${C.border}`, marginTop: 12 }}>
          <span style={{ color: C.textSec }}>Break-even sell price</span>
          <span style={{ fontWeight: 600, color: C.primary }}>
            {formatCurrency(margin.minimumViableSellPrice)}
          </span>
        </div>
      </div>
    </div>
  )
}
