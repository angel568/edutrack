import { useEffect, useState } from 'react'
import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { dashboardApi } from '../../api/services'

interface DashboardData {
  resumen: { totalEstudiantes: number; totalProfesores: number; totalMaterias: number }
  promediosMaterias: { nombre: string; promedio: number }[]
  asistencia: { porcentajeAsistencia: number; totalRegistros: number; totalPresentes: number }
}

const PIE_COLORS = ['#1A56DB', '#E5E7EB']

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18' }}>
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData]     = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.get().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <span className="spinner spinner-lg" style={{ color: 'var(--primary)' }} />
    </div>
  )

  const pieData = [
    { name: 'Presentes',  value: data?.asistencia.totalPresentes ?? 0 },
    { name: 'Ausencias',  value: (data?.asistencia.totalRegistros ?? 0) - (data?.asistencia.totalPresentes ?? 0) },
  ]

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Resumen general del sistema EduTrack</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Users}         label="Estudiantes activos" value={data?.resumen.totalEstudiantes ?? 0} color="#1A56DB" sub="Total registrados" />
        <StatCard icon={TrendingUp}    label="Profesores"          value={data?.resumen.totalProfesores  ?? 0} color="#0E9F6E" sub="Activos en el sistema" />
        <StatCard icon={BookOpen}      label="Materias"            value={data?.resumen.totalMaterias    ?? 0} color="#7E3AF2" sub="Activas este periodo" />
        <StatCard icon={ClipboardCheck} label="Asistencia global"  value={`${data?.asistencia.porcentajeAsistencia ?? 0}%`} color="#C27803" sub={`${data?.asistencia.totalRegistros ?? 0} registros totales`} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Bar chart */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Promedio por materia</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Promedio de calificaciones del periodo actual</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.promediosMaterias ?? []} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                formatter={(v: number) => [v.toFixed(1), 'Promedio']}
              />
              <Bar dataKey="promedio" fill="#1A56DB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Asistencia global</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Distribución presente / ausente</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{data?.asistencia.porcentajeAsistencia}%</span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>tasa de asistencia</p>
          </div>
        </div>
      </div>
    </div>
  )
}
