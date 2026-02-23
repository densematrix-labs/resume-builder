import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Menu, X, Globe } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export default function Layout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/builder', label: t('nav.builder') },
    { path: '/pricing', label: t('nav.pricing') },
  ]

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  return (
    <div className="min-h-screen flex flex-col noise-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                {t('app.name')}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'text-amber-400'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  data-testid="lang-switcher"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentLang.flag}</span>
                </button>
                
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code)
                          setLangMenuOpen(false)
                        }}
                        className={clsx(
                          'w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors',
                          i18n.language === lang.code
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Link
                to="/builder"
                className="hidden sm:inline-flex btn btn-primary text-sm"
              >
                {t('hero.cta')}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-slate-400 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950">
            <div className="px-4 py-4 space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                {t('footer.privacy')}
              </a>
              <a href="/terms" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
