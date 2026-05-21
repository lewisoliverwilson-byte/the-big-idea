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

const schema = z.object({
  budgetGbp: z.number().min(10, 'Minimum £10').max(100000, 'Maximum £100,000'),
  currency: z.enum(['GBP', 'USD']),
  unitSize: z.enum(['small', 'medium', 'large', 'xlarge']),
  category: z.string().optional(),
  minMarginPercent: z.number().min(0).max(80).optional(),
  trendingOnly: z.boolean().optional(),
  keywordsToAvoid: z.string().optional(),
  targetPlatforms: z.array(z.enum(['amazon', 'ebay', 'etsy', 'shopify'])).optional(),
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

// Dark-themed shared styles
const inputCls = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors text-sm"
const labelCls = "block text-xs font-medium text-slate-400 mb-1"

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
      budgetGbp: 200,
      currency: 'GBP',
      unitSize: 'medium',
      category: 'No preference',
      minMarginPercent: 20,
      trendingOnly: false,
    },
  })

  const currency = watch('currency')
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
      data.currency === 'GBP'
        ? data.budgetGbp / USD_TO_GBP
        : data.budgetGbp

    const params: SearchParams = {
      budgetUsd,
      currency: data.currency,
      unitSize: data.unitSize,
      category:
        data.category && data.category !== 'No preference'
          ? data.category
          : undefined,
      targetPlatforms: data.targetPlatforms?.length
        ? data.targetPlatforms
        : undefined,
      minMarginPercent: data.minMarginPercent,
      trendingOnly: data.trendingOnly,
      keywordsToAvoid: data.keywordsToAvoid,
    }

    mutation.mutate(params)
  }

  const isAtFreeLimit =
    user?.subscriptionStatus === 'free' && (user.reportsUsedFree || 0) >= 2

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Budget */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className={labelCls}>Budget ({currency === 'GBP' ? '£' : '$'})</label>
          <input
            type="number"
            min={10}
            max={100000}
            placeholder="200"
            className={inputCls}
            {...register('budgetGbp', { valueAsNumber: true })}
          />
          {errors.budgetGbp && <p className="text-red-400 text-xs mt-1">{errors.budgetGbp.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <select className={inputCls} {...register('currency')}>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Unit Size */}
      <div>
        <label className={labelCls}>Product size</label>
        <select className={inputCls} {...register('unitSize')}>
          <option value="small">Small — envelope size</option>
          <option value="medium">Medium — shoebox</option>
          <option value="large">Large — carries freely</option>
          <option value="xlarge">Extra large</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className={labelCls}>Category</label>
        <select className={inputCls} {...register('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Target Platforms */}
      <div>
        <label className={labelCls}>Sell on (optional)</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                targetPlatforms.includes(platform)
                  ? 'bg-amber-400 text-slate-900 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-400'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Min Margin */}
      <div>
        <label className={labelCls}>
          Min. margin: {watch('minMarginPercent') || 20}%
        </label>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          {...register('minMarginPercent', { valueAsNumber: true })}
          className="w-full accent-amber-400 h-1.5 rounded"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>10%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Trending Only */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register('trendingOnly')}
          className="w-4 h-4 rounded accent-amber-400"
        />
        <div>
          <span className="text-sm font-medium text-slate-300">Trending products only</span>
          <p className="text-xs text-slate-500">Only return products with upward trend</p>
        </div>
      </label>

      {/* Keywords to Avoid */}
      <div>
        <label className={labelCls}>Keywords to avoid (optional)</label>
        <input
          type="text"
          placeholder="e.g. fragile, batteries"
          className={inputCls}
          {...register('keywordsToAvoid')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending || isAtFreeLimit}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-bold px-4 py-3 rounded-xl text-sm transition-colors"
      >
        {mutation.isPending ? (
          <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        ) : isAtFreeLimit ? (
          'Upgrade to Continue'
        ) : (
          'Find My Product'
        )}
      </button>

      {mutation.isError && (
        <p className="text-sm text-red-400 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
