import { useEffect, useState } from 'react'
import { PlusCircle, X, Check } from 'lucide-react'
import { calificacionesApi, estudiantesApi, materiasApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import { useForm } from 'react-hook-form'

interface Cal { id:number; periodo:string; parcial1?:number; parcial2?:number; parcial3?:number; final?:number; promedio?:number; aprobado?:boolean; periodoAbierto:boolean; estudiante:{nombre:string;apellido:string;cedula:string}; materia:{nombre:string;codigo:string} }

export default function CalificacionesPage() {
  const { user } = useAuthStore()
  const [cals,      setCals]      = useState<Cal[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [estudiantes,setEstudiantes] = useState<any[]>([])
  const [materias,  setMaterias]  = useState<any[]>([])

  const { register, handleSubmit, reset, formState:{errors} } = useForm({
    defaultValues:{ estudianteId:'', materiaId:'', periodo:'', parcial1:'', parcial2:'', parcial3:'', final:'' }
  })

  const load = () => { setLoading(true); calificacionesApi.getAll().then(r=>setCals(r.data)).finally(()=>setLoading(false)) }

  useEffect(() => {
    load()
    if (user?.rol !== 'estudiante') {
      estudiantesApi.getAll().then(r=>setEstudiantes(r.data))
      materiasApi.getAll().then(r=>setMaterias(r.data))
    }
  }, [])

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const onSubmit = async (data:any) => {
    setSaving(true)
    try {
      await calificacionesApi.create(data)
      showToast('Calificación registrada'); reset(); setModal(false); load()
    } catch(e:any) { showToast('Error: '+(e.response?.data?.message||'Intenta de nuevo')) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding:'24px 28px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Calificaciones</h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>{cals.length} registros</p>
        </div>
        {user?.rol !== 'estudiante' && (
          <button className="btn btn-primary" onClick={()=>{reset();setModal(true)}}><PlusCircle size={15}/> Ingresar notas</button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Estudiante</th><th>Materia</th><th>Periodo</th><th>P1</th><th>P2</th><th>P3</th><th>Final</th><th>Promedio</th><th>Estado</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign:'center', padding:40 }}><span className="spinner" style={{ color:'var(--primary)' }}/></td></tr>
            ) : cals.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No hay calificaciones registradas</td></tr>
            ) : cals.map(c=>(
              <tr key={c.id}>
                <td style={{ fontWeight:500 }}>{c.estudiante.nombre} {c.estudiante.apellido}</td>
                <td style={{ fontSize:13 }}>{c.materia.nombre}</td>
                <td><code style={{ fontSize:12, background:'var(--surface-3)', padding:'2px 6px', borderRadius:4 }}>{c.periodo}</code></td>
                {[c.parcial1,c.parcial2,c.parcial3,c.final].map((n,i)=>(
                  <td key={i} style={{ textAlign:'center', fontSize:13 }}>{n??'—'}</td>
                ))}
                <td style={{ textAlign:'center', fontWeight:600 }}>{c.promedio?.toFixed(1)??'—'}</td>
                <td>
                  {c.promedio!=null
                    ? <span className={`badge ${c.aprobado?'badge-green':'badge-red'}`}>{c.aprobado?'Aprobado':'Reprobado'}</span>
                    : <span className="badge badge-gray">Pendiente</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize:16, fontWeight:600 }}>Ingresar calificaciones</h2>
              <button className="btn btn-ghost btn-sm" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label className="field-label">Estudiante *</label>
                  <select className="field-input" {...register('estudianteId',{required:true})}>
                    <option value="">Seleccionar...</option>
                    {estudiantes.map(e=><option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Materia *</label>
                  <select className="field-input" {...register('materiaId',{required:true})}>
                    <option value="">Seleccionar...</option>
                    {materias.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="field-label">Periodo * <span style={{ fontWeight:400, color:'var(--text-muted)' }}>(ej: 2025-1)</span></label>
                  <input className="field-input" placeholder="2025-1" {...register('periodo',{required:true})} />
                </div>
                {[['parcial1','Parcial 1'],['parcial2','Parcial 2'],['parcial3','Parcial 3'],['final','Final']].map(([f,l])=>(
                  <div key={f}>
                    <label className="field-label">{l}</label>
                    <input className="field-input" type="number" min={0} max={100} step={0.1} {...register(f as any,{min:0,max:100})} />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><span className="spinner spinner-sm"/> Guardando...</>:<><Check size={14}/> Guardar</>}
                </button>
              </div>
            </form>
          </div>
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
