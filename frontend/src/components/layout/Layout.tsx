import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, ClipboardCheck,
  GraduationCap, FileBarChart, LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard, roles: ['admin', 'profesor'] },
  { to: '/estudiantes',    label: 'Estudiantes',     icon: Users,           roles: ['admin', 'profesor'] },
  { to: '/materias',       label: 'Materias',        icon: BookOpen,        roles: ['admin', 'profesor'] },
  { to: '/asistencia',     label: 'Asistencia',      icon: ClipboardCheck,  roles: ['admin', 'profesor'] },
  { to: '/calificaciones', label: 'Calificaciones',  icon: GraduationCap,   roles: ['admin', 'profesor', 'estudiante'] },
  { to: '/reportes',       label: 'Reportes',        icon: FileBarChart,    roles: ['admin', 'profesor'] },
]

const ROLE_BADGE: Record<string, string> = {
  admin:      'badge badge-blue',
  profesor:   'badge badge-green',
  estudiante: 'badge badge-yellow',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const allowed = NAV_ITEMS.filter(n => user && n.roles.includes(user.rol))

  const Sidebar = ({ mobile = false }) => (
    <aside className={clsx(
      'flex flex-col h-full bg-white border-r border-gray-200',
      mobile ? 'w-full' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>E</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>EduTrack</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gestión Escolar</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allowed.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-blue-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-2">
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.nombre} {user?.apellido}
            </div>
            <span className={ROLE_BADGE[user?.rol || 'estudiante']} style={{ fontSize: 10, padding: '1px 6px' }}>
              {user?.rol}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost w-full btn-sm justify-start gap-2">
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full" style={{ width: 240, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50 flex flex-col" style={{ width: 260 }}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(true)} className="btn btn-ghost btn-sm p-1.5">
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>EduTrack</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-2)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
