import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
  id: string
  email: string
  displayName: string | null
  locale: string
  createdAt: string
  consentGiven: boolean
  onboardedModules: string[]
}

type Stats = {
  userCount: number
  sessionCount: number
  energyEntryCount: number
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function authFetch(path: string, token: string, init: RequestInit = {}) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
}

// ─── Login page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setError('Invalid credentials')
        return
      }
      const { token } = await res.json()
      sessionStorage.setItem('adminToken', token)
      onLogin(token)
    } catch {
      setError('Could not reach the API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-8">
        <h1 className="mb-1 text-xl font-semibold text-white">Wise Body</h1>
        <p className="mb-6 text-sm text-gray-400">Admin panel</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">Username</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [health, setHealth] = useState<'loading' | 'ok' | 'error'>('loading')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  // Create user form state
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newLocale, setNewLocale] = useState('nb')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function loadAll() {
    setLoadingUsers(true)
    try {
      const [statsRes, usersRes, healthRes] = await Promise.all([
        authFetch('/api/admin/stats', token),
        authFetch('/api/admin/users', token),
        fetch(`${API}/health`),
      ])

      if (statsRes.status === 401 || usersRes.status === 401) {
        onLogout()
        return
      }

      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      setHealth(healthRes.ok ? 'ok' : 'error')
    } catch {
      setHealth('error')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This removes all their data.`)) return
    await authFetch(`/api/admin/users/${id}`, token, { method: 'DELETE' })
    setUsers((u) => u.filter((x) => x.id !== id))
    setStats((s) => (s ? { ...s, userCount: s.userCount - 1 } : s))
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      const res = await authFetch('/api/admin/users', token, {
        method: 'POST',
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          displayName: newName || undefined,
          locale: newLocale,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setCreateError(body.message ?? 'Failed to create user')
        return
      }
      setNewEmail('')
      setNewPassword('')
      setNewName('')
      setNewLocale('nb')
      setShowCreate(false)
      await loadAll()
    } catch {
      setCreateError('Network error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <span className="font-semibold">Wise Body</span>
            <span className="ml-2 rounded bg-emerald-900 px-1.5 py-0.5 text-xs text-emerald-400">
              admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center gap-1.5 text-xs ${health === 'ok' ? 'text-emerald-400' : health === 'error' ? 'text-red-400' : 'text-gray-400'}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${health === 'ok' ? 'bg-emerald-400' : health === 'error' ? 'bg-red-400' : 'bg-gray-400'}`}
              />
              {health === 'ok' ? 'API healthy' : health === 'error' ? 'API unreachable' : 'Checking…'}
            </span>
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 p-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Users', value: stats.userCount },
              { label: 'Active sessions', value: stats.sessionCount },
              { label: 'Energy entries', value: stats.energyEntryCount },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Users</h2>
            <div className="flex gap-2">
              <button
                onClick={loadAll}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowCreate((v) => !v)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
              >
                {showCreate ? 'Cancel' : 'Add user'}
              </button>
            </div>
          </div>

          {/* Create user form */}
          {showCreate && (
            <form
              onSubmit={createUser}
              className="mb-4 rounded-xl border border-gray-700 bg-gray-900 p-4"
            >
              <p className="mb-3 text-sm font-medium">New user</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Password * (min 8)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Display name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Locale</label>
                  <select
                    value={newLocale}
                    onChange={(e) => setNewLocale(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="nb">nb (Norwegian)</option>
                    <option value="en">en (English)</option>
                  </select>
                </div>
              </div>
              {createError && <p className="mt-2 text-xs text-red-400">{createError}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          )}

          {/* Users table */}
          <div className="overflow-hidden rounded-xl border border-gray-800">
            {loadingUsers ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Loading…</p>
            ) : users.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No users yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900 text-left text-xs text-gray-400">
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Locale</th>
                    <th className="px-4 py-2.5 font-medium">Modules</th>
                    <th className="px-4 py-2.5 font-medium">Created</th>
                    <th className="px-4 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="bg-gray-900/50 hover:bg-gray-900">
                      <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3 text-gray-300">{u.displayName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{u.locale}</td>
                      <td className="px-4 py-3">
                        {u.onboardedModules.length ? (
                          u.onboardedModules.map((m) => (
                            <span
                              key={m}
                              className="mr-1 rounded bg-emerald-900/50 px-1.5 py-0.5 text-xs text-emerald-400"
                            >
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('adminToken'),
  )

  function handleLogin(t: string) {
    setToken(t)
  }

  function handleLogout() {
    sessionStorage.removeItem('adminToken')
    setToken(null)
  }

  if (!token) return <LoginPage onLogin={handleLogin} />
  return <Dashboard token={token} onLogout={handleLogout} />
}
