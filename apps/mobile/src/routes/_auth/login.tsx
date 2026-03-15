import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Battery } from 'lucide-react'
import { Button } from '@wise-body/ui/components/button'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/api'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

type Mode = 'login' | 'register'

function LoginPage() {
  const { t } = useTranslation('user')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await api.auth.login({ email, password })
        : await api.auth.register({ email, password, displayName: displayName || undefined, consentGiven: true })

      setAuth(res.accessToken, res.user)
      navigate({ to: '/', replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 404) {
          setError(t('login.error_invalid_credentials'))
        } else if (err.status === 409) {
          setError(t('login.error_email_taken'))
        } else {
          setError(t('login.error_generic'))
        }
      } else {
        setError(t('login.error_generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / app name */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Battery size={32} className="text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t('login.app_name', { defaultValue: 'Wise Body' })}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('login.tagline', { defaultValue: 'Din helsedagbok' })}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-border bg-muted/40 p-1">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'login' ? t('login.tab_login', { defaultValue: 'Logg inn' }) : t('login.tab_register', { defaultValue: 'Registrer deg' })}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="displayName">
                {t('login.field_name', { defaultValue: 'Navn (valgfritt)' })}
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder={t('login.placeholder_name', { defaultValue: 'Ditt navn' })}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              {t('login.field_email', { defaultValue: 'E-post' })}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="din@epost.no"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              {t('login.field_password', { defaultValue: 'Passord' })}
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={mode === 'register' ? t('login.placeholder_password_new', { defaultValue: 'Minst 8 tegn' }) : '••••••••'}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading
              ? '…'
              : mode === 'login'
                ? t('login.button_login', { defaultValue: 'Logg inn' })
                : t('login.button_register', { defaultValue: 'Opprett konto' })}
          </Button>
        </form>
      </div>
    </div>
  )
}
