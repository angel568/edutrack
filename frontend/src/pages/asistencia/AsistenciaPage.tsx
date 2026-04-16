import { useEffect, useState } from 'react'
import { ClipboardCheck, Check, X } from 'lucide-react'
import { asistenciaApi, materiasApi, estudiantesApi } from '../../api/services'

interface Materia    { id:number; nombre:string; codigo:string }
interface Estudiante { id:number; nombre:string; apellido:string; cedula:string }

type Estado = 'presente'|'ausente'|'tardanza'

const ESTADO_CONFIG = {
  presente: { label:'Presente', badge:'badge-green' },
  ausente:  { label:'Ausente',  badge:'badge-red'   },
  tardanza: { label:'Tardanza', badge:'badge-yellow' },
}

export default function AsistenciaPage() {
  const [materias,    setMaterias]    = useState<Materia[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [materiaId,   setMateriaId]   = useState('')
  const [fecha,       setFecha]       = useState(new Date().toISOString().split('T')[0])
  const [estados,     setEstados]     = useState<Record<number,Estado>>({})
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState('')

  useEffect(() => {
    materiasApi.getAll().then(r => setMaterias(r.data))
  }, [])

  useEffect(() => {
    if (!materiaId) return
    estudiantesApi.getAll().then(r => {
      setEstudiantes(r.data.filter((e:any) => e.activo))
      setEstados({})
    })
  }, [materiaId])

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const toggleEstado = (id:number) => {
    setEstados(prev => {
      const cur = prev[id] || 'presente'
      const next:Record<Estado,Estado> = { presente:'ausente', ausente:'tardanza', tardanza:'presente' }
      return { ...prev, [id]: next[cur] }
    })
  }

  const handleGuardar = async () => {
    if (!materiaId) return showToast('Error: Selecciona una materia')
    setSaving(true)
    try {
      for (const est of estudiantes) {
        await asistenciaApi.registrar({
          estudianteId: est.id,
          materiaId:    Number(materiaId),
          fecha,
          estado:       estados[est.id] || 'presente',
        })
      }
      showToast('Asistencia guardada correctamente')
    } catch { showToast('Error al guardar la asistencia') }
    finally { setSaving(false) }
  }

  const presentes  = estudiantes.filter(e => (estados[e.id]||'presente') === 'presente').length
  const ausentes   = estudiantes.filter(e => estados[e.id] === 'ausente').length
  const tardanzas  = estudiantes.filter(e => estados[e.id] === 'tardanza').length

  return (
    <div style={{ padding:'24px 28px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Asistencia</h1>
        <p style={{ fontSize:14, color:'var(--text-secondary)' }}>Registro diario de asistencia por materia</p>
      </div>

      {/* Controles */}
      <div className="card" style={{ padding:20, marginBottom:20, display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:16, alignItems:'end' }}>
        <div>
          <label className="field-label">Materia</label>
          <select className="field-input" value={materiaId} onChange={e=>setMateriaId(e.target.value)}>
            <option value="">Seleccionar materia...</option>
            {materias.map(m=><option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Fecha</label>
          <input className="field-input" type="date" value={fecha} max={new Date().toISOString().split('T')[0]} onChange={e=>setFecha(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleGuardar} disabled={saving || !materiaId || estudiantes.length === 0}>
          {saving ? <><span className="spinner spinner-sm" /> Guardando...</> : <><Check size={15} /> Guardar asistencia</>}
        </button>
      </div>

      {/* Stats */}
      {estudiantes.length > 0 && (
        <div style={{ display:'flex', gap:12, marginBottom:20 }}>
          {[['Presentes',presentes,'badge-green'],['Ausentes',ausentes,'badge-red'],['Tardanzas',tardanzas,'badge-yellow']].map(([l,v,b])=>(
            <div key={l as string} style={{ padding:'10px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', display:'flex', alignItems:'center', gap:10 }}>
              <span className={`badge ${b}`} style={{ fontSize:18, fontWeight:700, padding:'2px 10px' }}>{v}</span>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{l}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lista */}
      {materiaId && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Estudiante</th><th>Cédula</th><th>Estado</th><th>Cambiar</th></tr></thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No hay estudiantes activos</td></tr>
              ) : estudiantes.map(e => {
                const estado = estados[e.id] || 'presente'
                const cfg    = ESTADO_CONFIG[estado]
                return (
                  <tr key={e.id}>
                    <td style={{ fontWeight:500 }}>{e.nombre} {e.apellido}</td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:13 }}>{e.cedula}</td>
                    <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={()=>toggleEstado(e.id)}>
                        Cambiar →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!materiaId && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <ClipboardCheck size={40} style={{ margin:'0 auto 12px', opacity:.3 }} />
          <p>Selecciona una materia para registrar la asistencia</p>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.startsWith('Error')?'toast-error':'toast-success'}`}>
            {toast.startsWith('Error')?<X size={15}/>:<Check size={15}/>} {toast}
          </div>
        </div>
      )}
    </div>
  )
}
