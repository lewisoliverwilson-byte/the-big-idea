import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { submitSearch } from '../../services/api'
import { useReportStore } from '../../store/reportStore'
import { useAuthStore } from '../../store/authStore'
import { SearchParams } from '../../types'
import { USD_TO_GBP } from '../../utils/formatters'
import type { CSSProperties } from 'react'

const schema = z.object({
  budgetGbp:         z.number().min(10, 'Minimum £10').max(100000, 'Maximum £100,000'),
  currency:          z.enum(['GBP', 'USD']),
  unitSize:          z.enum(['small', 'medium', 'large', 'xlarge']),
  category:          z.string().optional(),
  minMarginPercent:  z.number().min(0).max(80).optional(),
  trendingOnly:      z.boolean().optional(),
  keywordsToAvoid:   z.string().optional(),
  targetPlatforms:   z.array(z.enum(['amazon', 'ebay', 'etsy', 'shopify'])).optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = [
  'No preference',
  'Electronics Accessories',
  'Home & Garden',
  'Pet Supplies',
  'Fashion Accessories',
  'Toys & Games',
  'Sports & Outdoors',
  'Beauty & Health',
  'Kitchen',
  'Office Supplies',
  'Auto Accessories',
  'Other',
]

const PLATFORMS = ['amazon', 'ebay', 'etsy', 'shopify'] as const

interface SearchFormProps {
  onPaywallHit?: () => void
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  width:        '100%',
  background:   'rgba(7,5,17,0.8)',
  border:       '1px solid rgba(139,92,246,0.2)',
  borderRadius: 10,
  padding:      '10px 14px',
  color:        '#F0EEFF',
  fontSize:     13,
  outline:      'none',
  transition:   'border-color 0.15s, box-shadow 0.15s',
  boxSizing:    'border-box',
  appearance:   'none',
}

const labelStyle: CSSProperties = {
  display:      'block',
  fontSize:     12,
  fontWeight:   500,
  color:        '#9B8ECF',
  marginBottom: 5,
}

const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'

export function SearchForm({ onPaywallHit }: SearchFormProps) {
  const navigate = useNavigate()
  const { setCurrentReportId, setIsGenerating } = useReportStore()
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      budgetGbp:        200,
      currency:         'GBP',
      unitSize:         'medium',
      category:         'No preference',
      minMarginPercent: 20,
      trendingOnly:     false,
    },
  })

  const currency        = watch('currency')
  const targetPlatforms = watch('targetPlatforms') || []

  const mutation = useMutation({
    mutationFn: (params: SearchParams) => submitSearch(params),
    onSuccess: (data) => {
      setCurrentReportId(data.reportId)
      setIsGenerating(true)
      navigate(`/report/${data.reportId}`)
    },
    onError: (error: any) => {
      if (error?.response?.status === 402 || error?.response?.status === 429) {
        onPaywallHit?.()
      }
    },
  })

  const togglePlatform = (platform: typeof PLATFORMS[number]) => {
    const current = targetPlatforms
    if (current.includes(platform)) {
      setValue('targetPlatforms', current.filter((p) => p !== platform))
    } else {
      setValue('targetPlatforms', [...current, platform])
    }
  }

  const onSubmit = (data: FormData) => {
    const budgetUsd =
      data.currency === 'GBP' ? data.budgetGbp / USD_TO_GBP : data.budgetGbp

    const params: SearchParams = {
      budgetUsd,
      currency:         data.currency,
      unitSize:         data.unitSize,
      category:         data.category && data.category !== 'No preference' ? data.category : undefined,
      targetPlatforms:  data.targetPlatforms?.length ? data.targetPlatforms : undefined,
      minMarginPercent: data.minMarginPercent,
      trendingOnly:     data.trendingOnly,
      keywordsToAvoid:  data.keywordsToAvoid,
    }

    mutation.mutate(params)
  }

  const isAtFreeLimit =
    user?.subscriptionStatus === 'free' && (user.reportsUsedFree || 0) >= 2

  const focusStyle = {
    borderColor: '#8B5CF6',
    boxShadow: '0 0 0 3px rgba(139,92,246,0.15)',
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Budget + Currency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <div>
          <label style={labelStyle}>Budget ({currency === 'GBP' ? '£' : '$'})</label>
          <input
            type="number"
            min={10}
            max={100000}
            placeholder="200"
            style={inputStyle}
            onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
            {...register('budgetGbp', { valueAsNumber: true })}
          />
          {errors.budgetGbp && <p style={{ color: '#F87171', fontSize: 11, marginTop: 3 }}>{errors.budgetGbp.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <select
            style={{ ...inputStyle, width: 80 }}
            onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
            {...register('currency')}
          >
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Unit Size */}
      <div>
        <label style={labelStyle}>Product size</label>
        <select
          style={inputStyle}
          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
          {...register('unitSize')}
        >
          <option value="small">Small — envelope size</option>
          <option value="medium">Medium — shoebox</option>
          <option value="large">Large — carries freely</option>
          <option value="xlarge">Extra large</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <select
          style={inputStyle}
          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
          {...register('category')}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Sell on */}
      <div>
        <label style={labelStyle}>Sell on (optional)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {PLATFORMS.map((platform) => {
            const active = targetPlatforms.includes(platform)
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                style={{
                  padding:      '6px 12px',
                  borderRadius: 8,
                  fontSize:     12,
                  fontWeight:   600,
                  border:       active ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.2)',
                  background:   active ? 'rgba(139,92,246,0.25)' : 'rgba(7,5,17,0.6)',
                  color:        active ? '#A78BFA' : '#9B8ECF',
                  cursor:       'pointer',
                  textTransform: 'capitalize',
                  transition:   'all 0.15s',
                }}
              >
                {platform}
              </button>
            )
          })}
        </div>
      </div>

      {/* Min Margin */}
      <div>
        <label style={labelStyle}>
          Min. margin: <span style={{ color: '#A78BFA' }}>{watch('minMarginPercent') || 20}%</span>
        </label>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          style={{ width: '100%', accentColor: '#8B5CF6', height: 4, borderRadius: 2 }}
          {...register('minMarginPercent', { valueAsNumber: true })}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5A4F7A', marginTop: 4 }}>
          <span>10%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Trending Only */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          {...register('trendingOnly')}
          style={{ width: 16, height: 16, borderRadius: 4, accentColor: '#8B5CF6', cursor: 'pointer' }}
        />
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F0EEFF' }}>Trending products only</span>
          <p style={{ fontSize: 11, color: '#9B8ECF', marginTop: 2 }}>Only return products with an upward trend</p>
        </div>
      </label>

      {/* Keywords to Avoid */}
      <div>
        <label style={labelStyle}>Keywords to avoid (optional)</label>
        <input
          type="text"
          placeholder="e.g. fragile, batteries"
          style={inputStyle}
          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
          {...register('keywordsToAvoid')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending || isAtFreeLimit}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            8,
          background:     GBTN,
          border:         '1px solid rgba(139,92,246,0.4)',
          borderRadius:   12,
          padding:        '12px 24px',
          color:          '#fff',
          fontSize:       13,
          fontWeight:     700,
          cursor:         mutation.isPending || isAtFreeLimit ? 'not-allowed' : 'pointer',
          opacity:        mutation.isPending || isAtFreeLimit ? 0.6 : 1,
          boxShadow:      '0 0 20px rgba(124,58,237,0.3)',
          transition:     'opacity 0.15s',
        }}
      >
        {mutation.isPending ? (
          <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : isAtFreeLimit ? (
          '🔒 Upgrade to Continue'
        ) : (
          '✦ Reveal My Fortune'
        )}
      </button>

      {mutation.isError && (
        <p style={{ fontSize: 12, color: '#F87171', textAlign: 'center' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
