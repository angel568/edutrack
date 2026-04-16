import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { authApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'

interface LoginForm { email: string; password: string }

const DEMO = [
  { label: 'Administrador', email: 'admin@edutrack.do',      pass: 'Admin123!',       color: '#1A56DB' },
  { label: 'Profesor',      email: 'mrodriguez@edutrack.do', pass: 'Profesor123!',    color: '#0E9F6E' },
  { label: 'Estudiante',    email: 'jmartinez@edutrack.do',  pass: 'Estudiante123!',  color: '#C27803' },
]

export default function LoginPage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true); setError('')
    try {
      const res = await authApi.login(data.email, data.password)
      setAuth(res.user, res.token)
      navigate(res.user.rol === 'estudiante' ? '/calificaciones' : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  const fillDemo = (email: string, pass: string) => {
    setValue('email', email); setValue('password', pass); setError('')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #EFF5FF 0%, #F3F4F6 50%, #EFF5FF 100%)',
    }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between p-12" style={{
        width: 420, background: 'var(--primary)',
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, #2563EB 0%, #1A56DB 40%, #1343B0 100%)',
      }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>EduTrack</span>
        </div>

        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 16 }}>
            Sistema de Gestión Escolar
          </div>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, lineHeight: 1.6 }}>
            Administra estudiantes, calificaciones, asistencia y más desde una plataforma centralizada.
          </p>
          <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
            {[['500+', 'Estudiantes'], ['50+', 'Materias'], ['99%', 'Disponibilidad']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>© 2025 EduTrack · Instituto Tecnológico de las Américas</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>EduTrack</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Iniciar sesión</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label className="field-label">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className={`field-input ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  type="email"
                  placeholder="usuario@edutrack.do"
                  {...register('email', { required: 'El correo es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })}
                />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className={`field-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner spinner-sm" />Ingresando...</> : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Acceso rápido demo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO.map(({ label, email, pass, color }) => (
                <button key={label} onClick={() => fillDemo(email, pass)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{email}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click para usar →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
