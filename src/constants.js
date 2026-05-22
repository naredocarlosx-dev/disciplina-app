export const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const MEAL_SLOTS = [
  { key: 'desayuno', label: 'Desayuno', color: '#185FA5' },
  { key: 'intermedio', label: 'Intermedio', color: '#1D9E75' },
  { key: 'comida', label: 'Comida', color: '#BA7517' },
  { key: 'post_entreno', label: 'Post entreno', color: '#D85A30' },
  { key: 'cena', label: 'Cena', color: '#534AB7' }
]

export const CAT_LABELS = {
  lacteos: 'Lácteos',
  verduras: 'Verduras y frutas',
  carnes: 'Carnes y proteína',
  granos: 'Granos y cereales',
  bebidas: 'Bebidas',
  otros: 'Otros'
}

export const CAT_ICONS = {
  lacteos: 'droplet',
  verduras: 'leaf',
  carnes: 'meat',
  granos: 'wheat',
  bebidas: 'bottle',
  otros: 'box'
}

export const ALERT_PCT = 3

export const BT_QUOTES = [
  "Sal de tu zona de confort. Solo puedes crecer si estás dispuesto a sentirte incómodo cuando intentas algo nuevo.",
  "Las personas exitosas son simplemente aquellas con hábitos exitosos.",
  "Dentro de ti, ahora mismo, tienes todo lo necesario para enfrentarte a cualquier cosa que el mundo te ponga enfrente.",
  "La clave del éxito es enfocar tu mente consciente en lo que deseas, no en lo que temes.",
  "Todas las personas exitosas son grandes soñadoras. Imaginan cómo podría ser su futuro y trabajan cada día hacia esa visión.",
  "No importa de dónde vengas. Lo único que importa es hacia dónde vas.",
  "Tu vida solo mejora cuando tú mejoras.",
  "He descubierto que la suerte es bastante predecible. Si quieres más suerte, toma más riesgos, sé más activo, aparece con más frecuencia.",
  "Cultiva una actitud de gratitud y da gracias por todo lo que te sucede, sabiendo que cada paso adelante es progreso.",
  "Imagina que no tienes límites; decide qué es correcto y deseable antes de decidir qué es posible.",
  "El acto de dar el primer paso es lo que separa a los ganadores de los perdedores.",
  "Eres completamente responsable de todo lo que eres, todo lo que tienes y todo lo que llegarás a ser.",
  "Invierte el tres por ciento de tus ingresos en ti mismo para garantizar tu futuro.",
  "Lo que crees con convicción se convierte en tu realidad.",
  "Establece la paz mental como tu objetivo más alto y organiza tu vida a su alrededor.",
  "El punto de partida de todo gran éxito siempre ha sido el mismo: soñar en grande.",
  "Cada minuto que dedicas a planificar te ahorra diez minutos de ejecución.",
  "Disciplinarte para hacer lo que sabes que es correcto, aunque sea difícil, es el camino hacia el orgullo, la autoestima y la satisfacción personal.",
  "La excelencia no es un destino; es un viaje continuo que nunca termina.",
  "El mayor error que podemos cometer es pensar que trabajamos para alguien más y no para nosotros mismos.",
  "La claridad es el concepto más importante en la productividad personal.",
  "Cuanto más busques oportunidades, más probable es que alcances la seguridad que deseas.",
  "Establecer metas es la práctica más importante para avanzar con confianza hacia tus sueños.",
  "Tu mayor activo es tu capacidad de generar ingresos. Tu mayor recurso es tu tiempo.",
  "Piensa con claridad en lo que quieres y luego toma las acciones que te acerquen más rápidamente a ello.",
  "Cuanto más generoso seas con tu reconocimiento, más recibirás. Cuanto más ayudes a otros, más querrán ayudarte.",
  "Los ganadores tienen el hábito de crear sus propias expectativas positivas antes de que ocurra el evento.",
  "El trabajo en equipo es tan importante que es prácticamente imposible alcanzar tu potencial sin dominarlo.",
  "El precio del éxito debe pagarse por completo y por adelantado. No existen los atajos.",
  "Tienes que hacer muchos pequeños esfuerzos que nadie ve ni aprecia antes de lograr algo verdaderamente valioso."
]

export const todayKey = new Date().toISOString().split('T')[0]

export function fq(q) {
  return q === Math.floor(q) ? String(q) : parseFloat(q.toFixed(2)).toString()
}

export const DEFAULT_USERS = [
  { id: 1, name: 'Administrador', email: 'admin@disciplina.com', pass: 'admin123', role: 'admin', status: 'active', created: todayKey },
  { id: 2, name: 'Demo Usuario', email: 'usuario@demo.com', pass: 'demo123', role: 'user', status: 'active', created: todayKey }
]

export function getInitialAppState() {
  return {
    habits: [
      { id: 1, name: 'Ahorrar hoy', cat: 'ahorro', doneToday: false, streak: 3, history: {} },
      { id: 2, name: 'Seguir mi dieta', cat: 'salud', doneToday: false, streak: 5, history: {} },
      { id: 3, name: 'Entrenar', cat: 'fitness', doneToday: false, streak: 2, history: {} }
    ],
    savings: [
      { id: 1, name: 'Fondo de emergencia', goal: 20000, current: 8500, deadline: '2025-12-31' },
      { id: 2, name: 'Vacaciones', goal: 15000, current: 3200, deadline: '2025-07-01' }
    ],
    meals: {},
    workouts: [
      { id: 1, name: 'Pecho y tríceps', days: ['L', 'X'], done: [], color: '#185FA5' },
      { id: 2, name: 'Espalda y bíceps', days: ['M', 'J'], done: [], color: '#1D9E75' },
      { id: 3, name: 'Piernas', days: ['V'], done: [], color: '#D85A30' }
    ],
    dietPlan: null,
    selectedDay: new Date().getDay(),
    activeSavingId: null,
    progressHistory: {},
    inventory: [
      { id: 1, name: 'Leche entera', cat: 'lacteos', unit: 'L', qty: 2.5, max: 4 },
      { id: 2, name: 'Arroz', cat: 'granos', unit: 'kg', qty: 1.8, max: 5 },
      { id: 3, name: 'Pechuga de pollo', cat: 'carnes', unit: 'g', qty: 150, max: 2000 },
      { id: 4, name: 'Espinacas', cat: 'verduras', unit: 'g', qty: 80, max: 500 },
      { id: 5, name: 'Huevos', cat: 'otros', unit: 'pzs', qty: 4, max: 30 },
      { id: 6, name: 'Avena', cat: 'granos', unit: 'g', qty: 25, max: 1000 }
    ],
    invLog: [],
    invFilter: 'todos',
    nextIds: { h: 4, s: 3, w: 4, inv: 7 },
    lastResetDate: new Date().toISOString().split('T')[0]
  }
}
