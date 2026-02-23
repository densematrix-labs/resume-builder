import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { useDeviceId } from '../lib/fingerprint'
import { useState } from 'react'

const plans = [
  {
    id: 'free',
    sku: null,
    price: 0,
    popular: false,
  },
  {
    id: 'starter',
    sku: 'starter_30',
    price: 299,
    popular: false,
  },
  {
    id: 'pro',
    sku: 'pro_100',
    price: 699,
    popular: true,
  },
  {
    id: 'unlimited',
    sku: 'unlimited_monthly',
    price: 999,
    popular: false,
  },
]

export default function PricingPage() {
  const { t } = useTranslation()
  const deviceId = useDeviceId()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (sku: string) => {
    if (!deviceId) return
    
    setLoading(sku)
    try {
      const response = await fetch('/api/v1/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_sku: sku,
          device_id: deviceId,
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout')
      }
      
      const data = await response.json()
      window.location.href = data.checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="py-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-slate-400">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`card relative animate-slide-up ${
                plan.popular
                  ? 'border-amber-500 ring-1 ring-amber-500/20'
                  : ''
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-medium bg-amber-500 text-slate-950 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="font-display text-xl font-semibold mb-2">
                {t(`pricing.${plan.id}.name`)}
              </h3>
              
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {t(`pricing.${plan.id}.price`)}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {(t(`pricing.${plan.id}.features`, { returnObjects: true }) as string[]).map(
                  (feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  )
                )}
              </ul>

              {plan.sku ? (
                <button
                  onClick={() => handlePurchase(plan.sku!)}
                  disabled={loading === plan.sku}
                  className={`w-full btn ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {loading === plan.sku ? t('common.loading') : t('pricing.buy_now')}
                </button>
              ) : (
                <button className="w-full btn btn-secondary" disabled>
                  {t('pricing.current_plan')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
