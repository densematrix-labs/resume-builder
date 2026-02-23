import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Sparkles, FileText, Download, Mail, Zap, Shield, Clock, Globe } from 'lucide-react'

export default function HomePage() {
  const { t } = useTranslation()

  const features = [
    { icon: Sparkles, title: t('features.ai_writer.title'), desc: t('features.ai_writer.description') },
    { icon: FileText, title: t('features.templates.title'), desc: t('features.templates.description') },
    { icon: Download, title: t('features.export.title'), desc: t('features.export.description') },
    { icon: Mail, title: t('features.cover_letter.title'), desc: t('features.cover_letter.description') },
  ]

  const comparisons = [
    { icon: Zap, title: t('alt.free_features') },
    { icon: Shield, title: t('alt.no_watermark') },
    { icon: Clock, title: t('alt.faster_ai') },
    { icon: Globe, title: t('alt.better_templates') },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            {t('hero.title')}{' '}
            <span className="gradient-text">{t('hero.subtitle')}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/builder" className="btn btn-primary text-lg px-8 py-4">
              {t('hero.cta')}
            </Link>
            <Link to="/builder" className="btn btn-secondary text-lg px-8 py-4">
              {t('hero.secondary_cta')}
            </Link>
          </div>

          {/* Trusted by */}
          <p className="mt-12 text-sm text-slate-500">
            Trusted by 50,000+ job seekers worldwide
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-16">
            {t('features.title')}
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card hover:border-amber-500/50 transition-colors group animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-r from-slate-900 to-slate-800 border-amber-500/20">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                {t('alt.title')}
              </h2>
              <p className="text-lg text-slate-400">
                {t('alt.comparison')}
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {comparisons.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of job seekers who landed their dream jobs with ResumeForge.
          </p>
          <Link to="/builder" className="btn btn-primary text-lg px-10 py-4">
            {t('hero.cta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
