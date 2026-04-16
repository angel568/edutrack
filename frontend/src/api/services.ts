import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ── AUTH ──────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
  me:       () => api.get('/auth/me').then(r => r.data),
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
  getUsers: () => api.get('/auth/users').then(r => r.data),
}

// ── ESTUDIANTES ───────────────────────────────────────
export const estudiantesApi = {
  getAll:  (params?: any) => api.get('/estudiantes', { params }).then(r => r.data),
  getOne:  (id: number)   => api.get(`/estudiantes/${id}`).then(r => r.data),
  create:  (data: any)    => api.post('/estudiantes', data).then(r => r.data),
  update:  (id: number, data: any) => api.put(`/estudiantes/${id}`, data).then(r => r.data),
  delete:  (id: number)   => api.delete(`/estudiantes/${id}`).then(r => r.data),
}

// ── MATERIAS ──────────────────────────────────────────
export const materiasApi = {
  getAll:  (params?: any) => api.get('/materias', { params }).then(r => r.data),
  getOne:  (id: number)   => api.get(`/materias/${id}`).then(r => r.data),
  create:  (data: any)    => api.post('/materias', data).then(r => r.data),
  update:  (id: number, data: any) => api.put(`/materias/${id}`, data).then(r => r.data),
  delete:  (id: number)   => api.delete(`/materias/${id}`).then(r => r.data),
}

// ── ASISTENCIA ────────────────────────────────────────
export const asistenciaApi = {
  getAll:      (params?: any) => api.get('/asistencia', { params }).then(r => r.data),
  registrar:   (data: any)    => api.post('/asistencia', data).then(r => r.data),
  getReporte:  (estudianteId: number, params?: any) =>
    api.get(`/asistencia/reporte/${estudianteId}`, { params }).then(r => r.data),
}

// ── CALIFICACIONES ────────────────────────────────────
export const calificacionesApi = {
  getAll:        (params?: any) => api.get('/calificaciones', { params }).then(r => r.data),
  create:        (data: any)    => api.post('/calificaciones', data).then(r => r.data),
  update:        (id: number, data: any) => api.put(`/calificaciones/${id}`, data).then(r => r.data),
  cerrarPeriodo: (materiaId: number, periodo: string) =>
    api.put('/calificaciones/cerrar-periodo', { materiaId, periodo }).then(r => r.data),
}

// ── DASHBOARD ─────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard').then(r => r.data),
}
