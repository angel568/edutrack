import { useEffect, useState } from 'react'
import { BookPlus, Pencil, Trash2, X, Check } from 'lucide-react'
import { materiasApi, authApi } from '../../api/services'
import { useForm } from 'react-hook-form'

interface Materia { id:number; nombre:string; codigo:string; creditos:number; grado:string; profesorId?:number; activa:boolean; profesor?:{id:number;nombre:string;apellido:string} }
interface Profesor { id:number; nombre:string; apellido:string }

const GRADOS = ['1ro Básico','2do Básico','3ro Básico','4to Básico','5to Básico','6to Básico','7mo Básico','8vo Básico','1ro Bachillerato','2do Bachillerato','3ro Bachillerato']

export default function MateriasPage() {
  const [materias, setMaterias]     = useState<Materia[]>([])
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState<'create'|'edit'|null>(null)
  const [selected, setSelected]     = useState<Materia|null>(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState('')

  const { register, handleSubmit, reset, formState:{errors} } = useForm({ defaultValues:{nombre:'',codigo:'',creditos:3,grado:'',profesorId:''} })

  const load = () => { setLoading(true); materiasApi.getAll().then(r=>setMaterias(r.data)).finally(()=>setLoading(false)) }

  useEffect(() => {
    load()
    authApi.getUsers().then(r => setProfesores(r.data.filter((u:any)=>u.rol==='profesor')))
  }, [])

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const openCreate = () => { reset({nombre:'',codigo:'',creditos:3,grado:'',profesorId:''}); setSelected(null); setModal('create') }
  const openEdit   = (m:Materia) => { reset({...m, profesorId:m.profesorId||''} as any); setSelected(m); setModal('edit') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const onSubmit = async (data:any) => {
    setSaving(true)
    try {
      if (modal==='create') await materiasApi.create(data)
      else if (selected)    await materiasApi.update(selected.id, data)
      showToast(modal==='create' ? 'Materia creada' : 'Materia actualizada')
      closeModal(); load()
    } catch(e:any) { showToast('Error: '+(e.response?.data?.message||'Intenta de nuevo')) }
    finally { setSaving(false) }
  }

  const handleDelete = async (m:Materia) => {
    if (!confirm(`¿Desactivar "${m.nombre}"?`)) return
    try { await materiasApi.delete(m.id); showToast('Materia desactivada'); load() }
    catch(e:any) { showToast('Error: '+(e.response?.data?.message||'No se pudo eliminar')) }
  }

  return (
    <div style={{ padding:'24px 28px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Materias</h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>{materias.length} materias activas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><BookPlus size={15} /> Nueva materia</button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Nombre</th><th>Código</th><th>Grado</th><th>Créditos</th><th>Profesor</th><th>Acciones</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40 }}><span className="spinner" style={{ color:'var(--primary)' }} /></td></tr>
            ) : materias.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight:500 }}>{m.nombre}</td>
                <td><code style={{ fontSize:12, background:'var(--surface-3)', padding:'2px 6px', borderRadius:4 }}>{m.codigo}</code></td>
                <td><span className="badge badge-blue">{m.grado}</span></td>
                <td style={{ textAlign:'center' }}>{m.creditos}</td>
                <td style={{ fontSize:13, color:'var(--text-secondary)' }}>
                  {m.profesor ? `${m.profesor.nombre} ${m.profesor.apellido}` : <span style={{ color:'var(--text-muted)' }}>Sin asignar</span>}
                </td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(m)}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>handleDelete(m)} style={{ color:'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize:16, fontWeight:600 }}>{modal==='create' ? 'Nueva materia' : 'Editar materia'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="field-label">Nombre <span style={{ color:'var(--danger)' }}>*</span></label>
                  <input className={`field-input ${errors.nombre?'error':''}`} {...register('nombre',{required:true})} />
                </div>
                <div>
                  <label className="field-label">Código <span style={{ color:'var(--danger)' }}>*</span></label>
                  <input className={`field-input ${errors.codigo?'error':''}`} placeholder="MAT101" {...register('codigo',{required:true})} />
                </div>
                <div>
                  <label className="field-label">Créditos <span style={{ color:'var(--danger)' }}>*</span></label>
                  <input className="field-input" type="number" min={1} max={6} {...register('creditos',{required:true,min:1,max:6})} />
                </div>
                <div>
                  <label className="field-label">Grado <span style={{ color:'var(--danger)' }}>*</span></label>
                  <select className="field-input" {...register('grado',{required:true})}>
                    <option value="">Seleccionar...</option>
                    {GRADOS.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Profesor</label>
                  <select className="field-input" {...register('profesorId')}>
                    <option value="">Sin asignar</option>
                    {profesores.map(p=><option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner spinner-sm" /> Guardando...</> : <><Check size={14} /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.startsWith('Error') ? 'toast-error':'toast-success'}`}>
            {toast.startsWith('Error') ? <X size={15} />:<Check size={15} />} {toast}
          </div>
        </div>
      )}
    </div>
  )
}
