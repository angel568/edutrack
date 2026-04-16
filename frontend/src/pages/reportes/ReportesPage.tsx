import { useState } from 'react'
import { FileSpreadsheet, FileText, Download, Filter } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface ReporteConfig { periodo: string; materiaId: string }

function ReporteCard({
  icon: Icon, title, desc, color, bgColor,
  onExcel, onPdf, loading,
}: {
  icon: any; title: string; desc: string; color: string; bgColor: string
  onExcel: () => void; onPdf?: () => void; loading: boolean
}) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={color} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{desc}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onExcel} disabled={loading} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <FileSpreadsheet size={14} color="#166534" />
          Exportar Excel
        </button>
        {onPdf && (
          <button onClick={onPdf} disabled={loading} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <FileText size={14} color="#991B1B" />
            Exportar PDF
          </button>
        )}
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ReporteConfig>({ periodo: '', materiaId: '' })

  const download = async (url: string, filename: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api${url}`, { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } finally { setLoading(false) }
  }

  const buildQuery = (extra?: Record<string, string>) => {
    const p = new URLSearchParams()
    if (filters.periodo)   p.set('periodo',   filters.periodo)
    if (filters.materiaId) p.set('materiaId', filters.materiaId)
    if (extra) Object.entries(extra).forEach(([k, v]) => v && p.set(k, v))
    return p.toString() ? `?${p.toString()}` : ''
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Reportes</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Exporta datos del sistema en formato Excel o PDF</p>
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Filter size={15} color="var(--text-secondary)" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Filtros opcionales</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label className="field-label">Periodo</label>
            <input
              className="field-input"
              placeholder="Ej: 2025-1"
              value={filters.periodo}
              onChange={e => setFilters(f => ({ ...f, periodo: e.target.value }))}
            />
          </div>
          <div>
            <label className="field-label">ID de Materia</label>
            <input
              className="field-input"
              placeholder="ID de materia"
              value={filters.materiaId}
              onChange={e => setFilters(f => ({ ...f, materiaId: e.target.value }))}
            />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
          Deja los campos vacíos para exportar todos los registros
        </p>
      </div>

      {/* Reportes disponibles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <ReporteCard
          icon={FileSpreadsheet}
          title="Reporte de Calificaciones"
          desc="Notas parciales, promedios y estado de aprobación por estudiante y materia"
          color="#166534" bgColor="#F0FDF4"
          loading={loading}
          onExcel={() => download(`/reportes/calificaciones/excel${buildQuery()}`, `calificaciones_${filters.periodo || 'todos'}.xlsx`)}
          onPdf={()   => download(`/reportes/calificaciones/pdf${buildQuery()}`,   `calificaciones_${filters.periodo || 'todos'}.pdf`)}
        />
        <ReporteCard
          icon={FileText}
          title="Reporte de Asistencia"
          desc="Registro de asistencia diaria con estado presente, ausente o tardanza"
          color="#1A56DB" bgColor="#EFF5FF"
          loading={loading}
          onExcel={() => download(`/reportes/asistencia/excel${buildQuery()}`, 'asistencia.xlsx')}
        />
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', fontSize: 14, color: 'var(--primary)' }}>
          <span className="spinner spinner-sm" style={{ color: 'var(--primary)' }} />
          Generando reporte, por favor espera...
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Formatos disponibles:</strong>
        {' '}<strong style={{ color: '#166534' }}>Excel (.xlsx)</strong> — incluye formato con colores y estilos listos para imprimir.
        {' '}<strong style={{ color: '#991B1B' }}>PDF</strong> — documento formal con encabezado institucional y tabla de datos.
      </div>
    </div>
  )
}
