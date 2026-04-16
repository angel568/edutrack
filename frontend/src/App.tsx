import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage        from './pages/auth/LoginPage'
import DashboardPage    from './pages/dashboard/DashboardPage'
import EstudiantesPage  from './pages/estudiantes/EstudiantesPage'
import MateriasPage     from './pages/materias/MateriasPage'
import AsistenciaPage   from './pages/asistencia/AsistenciaPage'
import CalificacionesPage from './pages/calificaciones/CalificacionesPage'
import ReportesPage     from './pages/reportes/ReportesPage'

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.rol)) return <Navigate to="/calificaciones" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { isAuthenticated } = useAuthStore()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard"      element={<PrivateRoute roles={['admin','profesor']}><DashboardPage /></PrivateRoute>} />
        <Route path="/estudiantes"    element={<PrivateRoute roles={['admin','profesor']}><EstudiantesPage /></PrivateRoute>} />
        <Route path="/materias"       element={<PrivateRoute roles={['admin','profesor']}><MateriasPage /></PrivateRoute>} />
        <Route path="/asistencia"     element={<PrivateRoute roles={['admin','profesor']}><AsistenciaPage /></PrivateRoute>} />
        <Route path="/calificaciones" element={<PrivateRoute><CalificacionesPage /></PrivateRoute>} />
        <Route path="/reportes"       element={<PrivateRoute roles={['admin','profesor']}><ReportesPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
