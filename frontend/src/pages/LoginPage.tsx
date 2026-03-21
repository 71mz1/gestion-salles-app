import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowRight, Eye, EyeOff, LaptopMinimal, Lock, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../state/auth'
import { authApi } from '../services/api'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useLayoutEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.login-panel', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
      gsap.fromTo('.login-card',  { x: 20,  opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
      gsap.fromTo('.login-field', { y: 10,  opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.35, ease: 'power2.out', delay: 0.25 })
    }, ref)
    return () => ctx.revert()
  }, [])

  function shake() {
    const obj = { x: 0 }
    gsap.to(obj, {
      x: 1, duration: 0.07, repeat: 5, yoyo: true, ease: 'none',
      onUpdate: () => { gsap.set('.login-card', { x: obj.x > 0.5 ? -7 : 7 }) },
      onComplete: () => { gsap.set('.login-card', { x: 0 }) },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      login(res.token, res.user)
      if (res.user.role === 'technicien' || res.user.role === 'professeur') {
  navigate('/pannes', { replace: true })
} else {
  navigate('/tableau-de-bord', { replace: true })
}
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiant ou mot de passe incorrect.')
      shake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className="flex min-h-screen bg-slate-50">

      {/* Left — photo panel */}
      <div
        className="login-panel relative hidden flex-1 flex-col justify-between overflow-hidden lg:flex"
        style={{
          backgroundImage: 'url("https://www.education.edu/wp-content/uploads/2016/09/4Y7A7527-scaled.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-teal-900/50" />

        <div className="relative flex items-center gap-2.5 p-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/20">
            E
          </div>
          <span className="text-sm font-semibold text-white">ENCGO Dashboard</span>
        </div>

        <div className="relative space-y-6 px-10 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <LaptopMinimal className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-md">
              Gestion des<br />salles informatiques
            </h1>
            <p className="text-sm text-white/70 leading-relaxed">
              Supervisez vos salles, postes et interventions en temps réel.
            </p>
          </div>

          <div className="space-y-2">
            {[
              'Suivi des pannes en temps réel',
              'Gestion des emplois du temps',
              'Export PDF des fiches techniques',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                <ShieldCheck className="h-4 w-4 shrink-0 text-teal-400" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative px-10 pb-10 text-xs text-white/30">© 2026 ENCGO · Oujda</p>
      </div>

      {/* right login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="login-card w-full max-w-sm space-y-7">

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs font-bold">E</div>
            <span className="text-sm font-semibold text-slate-800">ENCGO Dashboard</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">Connexion</h2>
            <p className="mt-1 text-sm text-slate-500">Accédez à votre espace de gestion.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="login-field space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-500">Email</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input type="email" placeholder="vous@encgo.ma" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="username" required />
              </div>
            </div>

            <div className="login-field space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-500">Mot de passe</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={cn('login-field rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600')}>
                {error}
              </div>
            )}

            <div className="login-field">
              <Button type="submit" size="lg" disabled={loading} className="group w-full">
                {loading ? 'Connexion…' : (
                  <><span>Se connecter</span><ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
