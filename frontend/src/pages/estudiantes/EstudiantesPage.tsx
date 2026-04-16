import { useEffect, useState } from 'react'
import { UserPlus, Search, Pencil, Trash2, X, Check } from 'lucide-react'
import { estudiantesApi } from '../../api/services'
import { useForm } from 'react-hook-form'

interface Estudiante {
  id: number; nombre: string; apellido: string; cedula: string
  email: string; telefono?: string; grado: string; activo: boolean
}

const GRADOS = ['1ro Básico','2do Básico','3ro Básico','4to Básico','5to Básico','6to Básico',
  '7mo Básico','8vo Básico','1ro Bachillerato','2do Bachillerato','3ro Bachillerato']

const emptyForm = { nombre:'', apellido:'', cedula:'', email:'', telefono:'', grado:'' }

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [loading, setLoading]         = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [modal, setModal]             = useState<'create'|'edit'|null>(null)
  const [selected, setSelected]       = useState<Estudiante | null>(null)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: emptyForm })

  const load = (q = '') => {
    setLoading(true)
    estudiantesApi.getAll(q ? { busqueda: q } : {})
      .then(r => setEstudiantes(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(() => load(busqueda), 350); return () => clearTimeout(t) }, [busqueda])

  const openCreate = () => { reset(emptyForm); setSelected(null); setModal('create') }
  const openEdit   = (e: Estudiante) => { reset(e as any); setSelected(e); setModal('edit') }
  const closeModal = () => { setModal(null); setSelected(null) }
  const showToast  = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      if (modal === 'create') await estudiantesApi.create(data)
      else if (selected)      await estudiantesApi.update(selected.id, data)
      showToast(modal === 'create' ? 'Estudiante registrado' : 'Estudiante actualizado')
      closeModal(); load(busqueda)
    } catch (e: any) {
      showToast('Error: ' + (e.response?.data?.message || 'Intenta de nuevo'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (e: Estudiante) => {
    if (!confirm(`¿Desactivar a ${e.nombre} ${e.apellido}?`)) return
    await estudiantesApi.delete(e.id)
    showToast('Estudiante desactivado'); load(busqueda)
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Estudiantes</h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>{estudiantes.length} registrados</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><UserPlus size={15} /> Nuevo estudiante</button>
      </div>

      <div style={{ position:'relative', marginBottom:20, maxWidth:400 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
        <input className="field-input" style={{ paddingLeft:36 }} placeholder="Buscar por nombre o cédula..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Estudiante</th><th>Cédula</th><th>Correo</th><th>Grado</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40 }}><span className="spinner" style={{ color:'var(--primary)' }} /></td></tr>
            ) : estudiantes.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No se encontraron estudiantes</td></tr>
            ) : estudiantes.map(e => (
              <tr key={e.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--primary)' }}>{e.nombre[0]}{e.apellido[0]}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight:500 }}>{e.nombre} {e.apellido}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{e.telefono || '—'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily:'DM Mono, monospace', fontSize:13 }}>{e.cedula}</td>
                <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{e.email}</td>
                <td><span className="badge badge-blue">{e.grado}</span></td>
                <td><span className={`badge ${e.activo ? 'badge-green' : 'badge-gray'}`}>{e.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(e)} style={{ color:'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize:16, fontWeight:600 }}>{modal === 'create' ? 'Nuevo estudiante' : 'Editar estudiante'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {(['nombre','apellido','cedula','email','telefono'] as const).map(field => (
                  <div key={field}>
                    <label className="field-label" style={{ textTransform:'capitalize' }}>{field}{field !== 'telefono' && <span style={{ color:'var(--danger)' }}> *</span>}</label>
                    <input className={`field-input ${(errors as any)[field] ? 'error' : ''}`}
                      type={field === 'email' ? 'email' : 'text'}
                      {...register(field, field !== 'telefono' ? { required: `${field} es requerido` } : {})} />
                  </div>
                ))}
                <div>
                  <label className="field-label">Grado <span style={{ color:'var(--danger)' }}>*</span></label>
                  <select className="field-input" {...register('grado', { required: true })}>
                    <option value="">Seleccionar...</option>
                    {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
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
          <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>
            {toast.startsWith('Error') ? <X size={15} /> : <Check size={15} />} {toast}
          </div>
        </div>
      )}
    </div>
  )
}
