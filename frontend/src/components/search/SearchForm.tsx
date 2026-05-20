import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
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
      if (error?.response?.status === 402) {
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

  // Check free tier limit
  const isAtFreeLimit =
    user?.subscriptionStatus === 'free' && (user.reportsUsedFree || 0) >= 2

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label={`Total Budget (${currency === 'GBP' ? '£' : '$'})`}
            type="number"
            min={10}
            max={100000}
            {...register('budgetGbp', { valueAsNumber: true })}
            error={errors.budgetGbp?.message}
            placeholder="200"
          />
        </div>
        <div>
          <Select label="Currency" {...register('currency')}>
            <option value="GBP">GBP (£)</option>
            <option value="USD">USD ($)</option>
          </Select>
        </div>
      </div>

      {/* Unit Size */}
      <Select
        label="Product Size"
        {...register('unitSize')}
        error={errors.unitSize?.message}
      >
        <option value="small">Small — fits in an envelope</option>
        <option value="medium">Medium — shoebox size</option>
        <option value="large">Large — carries freely</option>
        <option value="xlarge">Extra Large</option>
      </Select>

      {/* Category */}
      <Select label="Category (optional)" {...register('category')}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      {/* Target Platforms */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Target Sell Platforms (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                targetPlatforms.includes(platform)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Margin */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Minimum Margin: {watch('minMarginPercent') || 20}%
        </label>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          {...register('minMarginPercent', { valueAsNumber: true })}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>10%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Trending Only */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register('trendingOnly')}
          className="w-4 h-4 rounded accent-indigo-600"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">
            Trending products only
          </span>
          <p className="text-xs text-gray-500">
            Only return products with upward search trend
          </p>
        </div>
      </label>

      {/* Keywords to Avoid */}
      <Input
        label="Keywords to Avoid (optional)"
        {...register('keywordsToAvoid')}
        placeholder="e.g. fragile, batteries, food"
        hint="Comma-separated keywords to exclude from results"
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={mutation.isPending}
        disabled={isAtFreeLimit}
      >
        {isAtFreeLimit ? 'Upgrade to Continue' : 'Find My Product'}
      </Button>

      {mutation.isError && (
        <p className="text-sm text-red-600 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
