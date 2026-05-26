import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { MEAL_SLOTS, CAT_LABELS, fq } from '../constants'

function ModalWrapper({ id, children, maxWidth }) {
  const { modal, closeModal } = useContext(AppContext)
  if (modal !== id) return null
  return (
    <div className="modal-overlay" onClick={e => e.target.classList.contains('modal-overlay') && closeModal()}>
      <div className="modal" style={maxWidth ? { maxWidth } : {}}>
        {children}
      </div>
    </div>
  )
}

// 1. Habit Modal
function HabitModal() {
  const { addHabit, closeModal } = useContext(AppContext)
  const [name, setName] = useState('')
  const [cat, setCat] = useState('salud')

  const handleSave = () => {
    if (!name.trim()) return
    addHabit({ name: name.trim(), cat })
    setName('')
    setCat('salud')
    closeModal()
  }

  return (
    <ModalWrapper id="habit">
      <div className="modal-title">Nuevo hábito</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Beber 2L de agua" onKeyDown={e => e.key === 'Enter' && handleSave()} />
      </div>
      <div className="form-row-m">
        <label className="form-label-m">Categoría</label>
        <select value={cat} onChange={e => setCat(e.target.value)}>
          <option value="salud">Salud</option>
          <option value="ahorro">Ahorro</option>
          <option value="fitness">Fitness</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 2. Saving Modal
function SavingModal() {
  const { addSaving, closeModal } = useContext(AppContext)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSave = () => {
    if (!name.trim() || !goal) return
    addSaving({ name: name.trim(), goal, deadline })
    setName('')
    setGoal('')
    setDeadline('')
    closeModal()
  }

  return (
    <ModalWrapper id="saving">
      <div className="modal-title">Nueva meta de ahorro</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Vacaciones" />
      </div>
      <div className="form-grid">
        <div className="form-row-m">
          <label className="form-label-m">Meta ($)</label>
          <input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="10000" />
        </div>
        <div className="form-row-m">
          <label className="form-label-m">Fecha límite</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 3. Contribute Modal
function ContributeModal() {
  const { addContribution, closeModal } = useContext(AppContext)
  const [amount, setAmount] = useState('')

  const handleSave = () => {
    if (!amount) return
    addContribution(parseFloat(amount))
    setAmount('')
  }

  return (
    <ModalWrapper id="contribute">
      <div className="modal-title">Registrar aportación</div>
      <div className="form-row-m">
        <label className="form-label-m">Monto ($)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" onKeyDown={e => e.key === 'Enter' && handleSave()} />
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 4. Workout Modal
function WorkoutModal() {
  const { addWorkout, closeModal } = useContext(AppContext)
  const [name, setName] = useState('')
  const [days, setDays] = useState([])

  const dayOptions = [
    { value: 'L', label: 'Lun' },
    { value: 'M', label: 'Mar' },
    { value: 'X', label: 'Mié' },
    { value: 'J', label: 'Jue' },
    { value: 'V', label: 'Vie' },
    { value: 'S', label: 'Sáb' },
    { value: 'D', label: 'Dom' }
  ]

  const toggleDay = (d) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const handleSave = () => {
    if (!name.trim()) return
    addWorkout({ name: name.trim(), days })
    setName('')
    setDays([])
  }

  return (
    <ModalWrapper id="workout">
      <div className="modal-title">Nueva rutina</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Pecho y tríceps" />
      </div>
      <div className="form-row-m">
        <label className="form-label-m">Días</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          {dayOptions.map(opt => (
            <label key={opt.value} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
              <input
                type="checkbox"
                value={opt.value}
                checked={days.includes(opt.value)}
                onChange={() => toggleDay(opt.value)}
                style={{ width: 'auto' }}
              /> {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 5. Meal Editor Modal
function MealEditorModal() {
  const { appState, saveMeals, closeModal, modal } = useContext(AppContext)
  const [slots, setSlots] = useState({})

  useEffect(() => {
    if (modal === 'meal-editor' && appState) {
      const dm = appState.meals[appState.selectedDay] || {}
      const init = {}
      MEAL_SLOTS.forEach(sl => {
        init[sl.key] = { food: dm[sl.key]?.food || '', time: dm[sl.key]?.time || '' }
      })
      setSlots(init)
    }
  }, [modal, appState?.selectedDay])

  const updateSlot = (key, field, value) => {
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const handleSave = () => {
    saveMeals(slots)
  }

  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <ModalWrapper id="meal-editor" maxWidth={500}>
      <div className="modal-title">
        Editar comidas — {appState ? DAYS[appState.selectedDay] : ''}
      </div>
      {MEAL_SLOTS.map(sl => (
        <div key={sl.key} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: sl.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: sl.color, display: 'inline-block' }}></span>
            {sl.label}
          </div>
          <div className="form-grid">
            <div>
              <label className="form-label-m">Comida</label>
              <input type="text" value={slots[sl.key]?.food || ''} onChange={e => updateSlot(sl.key, 'food', e.target.value)} placeholder="Ej: Avena con fruta" />
            </div>
            <div>
              <label className="form-label-m">Horario</label>
              <input type="time" value={slots[sl.key]?.time || ''} onChange={e => updateSlot(sl.key, 'time', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 6. Diet Plan Modal
function DietModal() {
  const { appState, saveDietPlan, closeModal, modal } = useContext(AppContext)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  useEffect(() => {
    if (modal === 'diet' && appState?.dietPlan) {
      setName(appState.dietPlan.name || '')
      setDesc(appState.dietPlan.desc || '')
    }
  }, [modal])

  const handleSave = () => {
    if (!name.trim()) return
    saveDietPlan({ name: name.trim(), desc: desc.trim() })
  }

  return (
    <ModalWrapper id="diet">
      <div className="modal-title">Plan de dieta</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre del plan</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Déficit calórico 1800 kcal" />
      </div>
      <div className="form-row-m">
        <label className="form-label-m">Notas</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Alta en proteína, baja en carbohidratos..."></textarea>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 7. Inventory Add/Edit Modal
function InvAddModal() {
  const { appState, saveInvProduct, closeModal, modal, modalData } = useContext(AppContext)
  const [name, setName] = useState('')
  const [cat, setCat] = useState('lacteos')
  const [unit, setUnit] = useState('g')
  const [qty, setQty] = useState('')
  const [max, setMax] = useState('')

  const isEdit = modalData?.editId != null

  useEffect(() => {
    if (modal === 'inv-add') {
      if (isEdit && appState) {
        const p = appState.inventory.find(x => x.id === modalData.editId)
        if (p) {
          setName(p.name)
          setCat(p.cat)
          setUnit(p.unit)
          setQty(String(p.qty))
          setMax(String(p.max))
        }
      } else {
        setName('')
        setCat('lacteos')
        setUnit('g')
        setQty('')
        setMax('')
      }
    }
  }, [modal, modalData])

  const handleSave = () => {
    if (!name.trim()) return
    saveInvProduct({ name: name.trim(), cat, unit, qty, max })
  }

  return (
    <ModalWrapper id="inv-add">
      <div className="modal-title">{isEdit ? 'Editar producto' : 'Agregar producto'}</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Leche entera" />
      </div>
      <div className="form-grid">
        <div className="form-row-m">
          <label className="form-label-m">Categoría</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            <option value="lacteos">Lácteos</option>
            <option value="verduras">Verduras y frutas</option>
            <option value="carnes">Carnes y proteína</option>
            <option value="granos">Granos y cereales</option>
            <option value="bebidas">Bebidas</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <div className="form-row-m">
          <label className="form-label-m">Unidad</label>
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            <option value="g">Gramos (g)</option>
            <option value="kg">Kilogramos (kg)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="L">Litros (L)</option>
            <option value="pzs">Piezas (pzs)</option>
            <option value="porciones">Porciones</option>
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-row-m">
          <label className="form-label-m">Cantidad actual</label>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" min="0" step="0.01" />
        </div>
        <div className="form-row-m">
          <label className="form-label-m">Cantidad máxima</label>
          <input type="number" value={max} onChange={e => setMax(e.target.value)} placeholder="1000" min="1" step="0.01" />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 10px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)', marginBottom: 4 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 13, verticalAlign: '-1px' }}></i> Alerta crítica al llegar al <strong>3%</strong> del máximo.
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>{isEdit ? 'Actualizar' : 'Agregar'}</button>
      </div>
    </ModalWrapper>
  )
}

// 8. Inventory Move Modal
function InvMoveModal() {
  const { appState, saveInvMove, closeModal, modal, modalData } = useContext(AppContext)
  const [mvType, setMvType] = useState('use')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (modal === 'inv-move') {
      setMvType('use')
      setQty('')
      setNote('')
    }
  }, [modal])

  const product = appState?.inventory.find(p => p.id === modalData?.moveId)

  const handleSave = () => {
    const q = parseFloat(qty)
    if (!q || q <= 0) return
    saveInvMove({ qty: q, note: note.trim(), mvType })
  }

  if (!product) return null

  return (
    <ModalWrapper id="inv-move">
      <div className="modal-title">Registrar movimiento</div>
      <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
          Stock: <strong>{fq(product.qty)}</strong> {product.unit}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`move-type-btn${mvType === 'use' ? ' active-use' : ''}`}
          onClick={() => setMvType('use')}
        >
          <i className="ti ti-minus" style={{ fontSize: 16 }}></i>Consumir
        </button>
        <button
          className={`move-type-btn${mvType === 'buy' ? ' active-buy' : ''}`}
          onClick={() => setMvType('buy')}
        >
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i>Compra del súper
        </button>
      </div>
      <div className="form-row-m">
        <label className="form-label-m">{mvType === 'use' ? 'Cantidad a descontar' : 'Cantidad a agregar (compra del súper)'}</label>
        <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" min="0.01" step="0.01" />
      </div>
      <div className="form-row-m">
        <label className="form-label-m">Nota (opcional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: desayuno, compra semanal..." />
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Registrar</button>
      </div>
    </ModalWrapper>
  )
}

// 9. Add User Modal
function AddUserModal() {
  const { adminAddUser, closeModal } = useContext(AppContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const result = await adminAddUser({ name: name.trim(), email: email.trim().toLowerCase(), pass, role })
    if (!result.ok) {
      setError(result.error)
    } else {
      setError('')
      setName('')
      setEmail('')
      setPass('')
      setRole('user')
    }
  }

  return (
    <ModalWrapper id="add-user">
      <div className="modal-title">Agregar usuario</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" />
      </div>
      <div className="form-row-m">
        <label className="form-label-m">Correo</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
      </div>
      <div className="form-grid">
        <div className="form-row-m">
          <label className="form-label-m">Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña" />
        </div>
        <div className="form-row-m">
          <label className="form-label-m">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>
      {error && <div className="auth-error" style={{ marginTop: 8 }}>{error}</div>}
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Agregar</button>
      </div>
    </ModalWrapper>
  )
}

// 10. Edit User Modal
function EditUserModal() {
  const { adminSaveUser, closeModal, modal, modalData } = useContext(AppContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [status, setStatus] = useState('active')

  useEffect(() => {
    if (modal === 'edit-user' && modalData?.user) {
      const u = modalData.user
      setName(u.name)
      setEmail(u.email)
      setRole(u.role)
      setStatus(u.status)
    }
  }, [modal, modalData])

  const handleSave = () => {
    if (!modalData?.user) return
    adminSaveUser({ id: modalData.user.id, name: name.trim(), email: email.trim(), role, status })
  }

  return (
    <ModalWrapper id="edit-user">
      <div className="modal-title">Editar usuario</div>
      <div className="form-row-m">
        <label className="form-label-m">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-row-m">
        <label className="form-label-m">Correo</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-grid">
        <div className="form-row-m">
          <label className="form-label-m">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="form-row-m">
          <label className="form-label-m">Estado</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-dark" onClick={handleSave}>Guardar</button>
      </div>
    </ModalWrapper>
  )
}

// 11. Upgrade Modal (plan FREE → PRO)
function UpgradeModal() {
  const { upgradeToPro, closeModal } = useContext(AppContext)

  const handleUpgrade = async () => {
    await upgradeToPro()
    closeModal()
  }

  return (
    <ModalWrapper id="upgrade" maxWidth={440}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
        <div className="modal-title" style={{ marginBottom: 4 }}>Límite del plan FREE</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
          Has alcanzado el límite de tu plan gratuito. Actualiza a PRO para agregar todo sin restricciones.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* FREE */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 14px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>FREE</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>$0</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2 }}>
            <div>✓ Hasta 3 hábitos</div>
            <div>✓ 1 meta de ahorro</div>
            <div>✓ Comidas, fitness e inventario</div>
          </div>
        </div>
        {/* PRO */}
        <div style={{ border: '2px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '16px 14px', background: 'var(--accent-light, #f0f7ff)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, right: 10, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>RECOMENDADO</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>PRO</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>$50 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text2)' }}>MXN/mes</span></div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>o $499 MXN/año (ahorras $101)</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2 }}>
            <div>✓ Hábitos ilimitados</div>
            <div>✓ Metas de ahorro ilimitadas</div>
            <div>✓ Todo sin restricciones</div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-outline" onClick={closeModal}>Ahora no</button>
        <button className="btn btn-dark" onClick={handleUpgrade}>
          <i className="ti ti-bolt" style={{ fontSize: 15 }}></i>Activar PRO
        </button>
      </div>
    </ModalWrapper>
  )
}

export default function AllModals() {
  return (
    <>
      <HabitModal />
      <SavingModal />
      <ContributeModal />
      <WorkoutModal />
      <MealEditorModal />
      <DietModal />
      <InvAddModal />
      <InvMoveModal />
      <AddUserModal />
      <EditUserModal />
      <UpgradeModal />
    </>
  )
}
