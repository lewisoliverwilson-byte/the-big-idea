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
  'No preference', 'Electronics Accessories', 'Home & Garden', 'Pet Supplies',
  'Fashion Accessories', 'Toys & Games', 'Sports & Outdoors', 'Beauty & Health',
  'Kitchen', 'Office Supplies', 'Auto Accessories', 'Other',
]

const PLATFORMS = ['amazon', 'ebay', 'etsy', 'shopify'] as const

interface SearchFormProps {
  onPaywallHit?: () => void
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  width:        '100%',
  background:   '#FFFFFF',
  border:       '1px solid #CBD5E1',
  borderRadius: 8,
  padding:      '9px 12px',
  color:        '#0F172A',
  fontSize:     13,
  outline:      'none',
  transition:   'border-color 0.12s, box-shadow 0.12s',
  boxSizing:    'border-box',
  appearance:   'none',
  fontFamily:   'Inter, system-ui, sans-serif',
}

const labelStyle: CSSProperties = {
  display:      'block',
  fontSize:     12,
  fontWeight:   500,
  color:        '#475569',
  marginBottom: 5,
  fontFamily:   'Inter, system-ui, sans-serif',
}

const focusStyle = {
  borderColor: '#6366F1',
  boxShadow:   '0 0 0 3px rgba(99,102,241,0.12)',
}

export function SearchForm({ onPaywallHit }: SearchFormProps) {
  const navigate = useNavigate()
  const { setCurrentReportId, setIsGenerating } = useReportStore()
  const { user }  = useAuthStore()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
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
      if (error?.response?.status === 402 || error?.response?.status === 429) onPaywallHit?.()
    },
  })

  const togglePlatform = (platform: typeof PLATFORMS[number]) => {
    const current = targetPlatforms
    if (current.includes(platform)) setValue('targetPlatforms', current.filter(p => p !== platform))
    else setValue('targetPlatforms', [...current, platform])
  }

  const onSubmit = (data: FormData) => {
    const budgetUsd = data.currency === 'GBP' ? data.budgetGbp / USD_TO_GBP : data.budgetGbp
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

  const isAtFreeLimit = user?.subscriptionStatus === 'free' && (user.reportsUsedFree || 0) >= 2

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Budget + Currency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <div>
          <label style={labelStyle}>Budget ({currency === 'GBP' ? '£' : '$'})</label>
          <input
            type="number" min={10} max={100000} placeholder="200"
            style={inputStyle}
            onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
            {...register('budgetGbp', { valueAsNumber: true })}
            onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {errors.budgetGbp && <p style={{ color: '#DC2626', fontSize: 11, marginTop: 3 }}>{errors.budgetGbp.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <select
            style={{ ...inputStyle, width: 76 }}
            onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
            {...register('currency')}
            onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
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
          onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
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
          onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Sell on */}
      <div>
        <label style={labelStyle}>Sell on (optional)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
          {PLATFORMS.map(platform => {
            const active = targetPlatforms.includes(platform)
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                style={{
                  padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border:      active ? '1px solid #6366F1' : '1px solid #E2E8F0',
                  background:  active ? '#EEF2FF' : '#FFFFFF',
                  color:       active ? '#4F46E5' : '#64748B',
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.12s',
                  fontFamily: 'Inter, system-ui, sans-serif',
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
          Min. margin:{' '}
          <span style={{ color: '#4F46E5', fontWeight: 600 }}>{watch('minMarginPercent') || 20}%</span>
        </label>
        <input
          type="range" min={10} max={80} step={5}
          style={{ width: '100%', accentColor: '#4F46E5', height: 4, borderRadius: 2 }}
          {...register('minMarginPercent', { valueAsNumber: true })}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', marginTop: 3 }}>
          <span>10%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Trending Only */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
        <input
          type="checkbox"
          {...register('trendingOnly')}
          style={{ width: 15, height: 15, borderRadius: 4, accentColor: '#4F46E5', cursor: 'pointer' }}
        />
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Trending products only
          </span>
          <p style={{ fontSize: 11, color: '#64748B', marginTop: 1, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Only return products with an upward trend
          </p>
        </div>
      </label>

      {/* Keywords to Avoid */}
      <div>
        <label style={labelStyle}>Keywords to avoid (optional)</label>
        <input
          type="text" placeholder="e.g. fragile, batteries"
          style={inputStyle}
          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
          {...register('keywordsToAvoid')}
          onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending || isAtFreeLimit}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: mutation.isPending || isAtFreeLimit ? '#818CF8' : '#4F46E5',
          border: 'none', borderRadius: 8, padding: '11px 20px',
          color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: mutation.isPending || isAtFreeLimit ? 'not-allowed' : 'pointer',
          opacity: mutation.isPending || isAtFreeLimit ? 0.7 : 1, transition: 'background 0.12s',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
        onMouseEnter={e => { if (!mutation.isPending && !isAtFreeLimit) (e.currentTarget as HTMLButtonElement).style.background = '#4338CA' }}
        onMouseLeave={e => { if (!mutation.isPending && !isAtFreeLimit) (e.currentTarget as HTMLButtonElement).style.background = '#4F46E5' }}
      >
        {mutation.isPending ? (
          <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : isAtFreeLimit ? (
          '🔒 Upgrade to Continue'
        ) : (
          'Find Products →'
        )}
      </button>

      {mutation.isError && (
        <p style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
