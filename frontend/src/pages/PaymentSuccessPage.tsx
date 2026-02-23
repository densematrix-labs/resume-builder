import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDeviceId } from '../lib/fingerprint'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()
  const deviceId = useDeviceId()
  const [tokensAdded, setTokensAdded] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenStatus = async () => {
      if (!deviceId) return
      
      try {
        const response = await fetch('/api/v1/resume/tokens', {
          headers: { 'X-Device-Id': deviceId },
        })
        if (response.ok) {
          const data = await response.json()
          setTokensAdded(data.tokens_remaining)
        }
      } catch (error) {
        console.error('Failed to fetch token status:', error)
      } finally {
        setLoading(false)
      }
    }

    // Wait a moment for webhook to process
    const timer = setTimeout(fetchTokenStatus, 1000)
    return () => clearTimeout(timer)
  }, [deviceId])

  return (
    <div className="py-20 animate-fade-in">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="card">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="font-display text-3xl font-bold mb-4">
            {t('payment.success_title')}
          </h1>
          
          <p className="text-slate-400 mb-8">
            {t('payment.success_message')}
          </p>

          {loading ? (
            <div className="mb-8">
              <div className="w-8 h-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tokensAdded !== null && (
            <div className="mb-8 p-4 rounded-lg bg-slate-800">
              <p className="text-sm text-slate-400 mb-1">{t('payment.tokens_added')}</p>
              <p className="text-3xl font-bold text-amber-400">{tokensAdded}</p>
            </div>
          )}

          <Link to="/builder" className="btn btn-primary w-full">
            {t('payment.continue')}
          </Link>
        </div>
      </div>
    </div>
  )
}
