const TERMS = {
  title: 'Términos y Condiciones',
  sections: [
    {
      heading: '1. Aceptación de los términos',
      body: 'Al crear una cuenta y usar Episodio Uno (episodiouno.com), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el servicio.',
    },
    {
      heading: '2. Descripción del servicio',
      body: 'Episodio Uno es una aplicación de disciplina personal que permite a los usuarios registrar hábitos, metas de ahorro, rutinas de fitness, planificación de comidas e inventario de cocina. El servicio está destinado exclusivamente para uso personal.',
    },
    {
      heading: '3. Cuentas de usuario',
      body: 'Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas bajo tu cuenta. Episodio Uno se reserva el derecho de cancelar cuentas que violen estos términos, realicen uso abusivo del servicio, intenten acceder sin autorización a sistemas de la plataforma, o utilicen el servicio con fines comerciales no autorizados.',
    },
    {
      heading: '4. Plan PRO y pagos',
      body: 'El plan PRO tiene un costo de $50 MXN por mes. El cobro se renueva automáticamente al inicio de cada período de facturación. Puedes cancelar tu suscripción en cualquier momento desde la plataforma de pago (Stripe) o contactando a noreply@episodiouno.com. No se realizan reembolsos por períodos parciales ya facturados. La prueba gratuita de 3 meses no requiere tarjeta de crédito.',
    },
    {
      heading: '5. Disponibilidad del servicio',
      body: 'Episodio Uno no garantiza disponibilidad ininterrumpida del servicio. Podemos realizar mantenimientos programados o no programados. Haremos esfuerzos razonables para notificar interrupciones significativas.',
    },
    {
      heading: '6. Limitación de responsabilidad',
      body: 'Episodio Uno no se hace responsable por pérdida de datos, interrupciones del servicio, daños directos o indirectos derivados del uso de la aplicación. El servicio se proporciona "tal como está" sin garantías expresas o implícitas.',
    },
    {
      heading: '7. Modificaciones',
      body: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios importantes serán notificados por correo electrónico o mediante aviso dentro de la aplicación. El uso continuado del servicio después de los cambios implica aceptación.',
    },
    {
      heading: '8. Contacto',
      body: 'Para cualquier pregunta sobre estos términos, contáctanos en noreply@episodiouno.com.',
    },
  ],
}

const PRIVACY = {
  title: 'Política de Privacidad',
  sections: [
    {
      heading: '1. Datos que recolectamos',
      body: 'Recopilamos los siguientes datos personales: nombre completo, dirección de correo electrónico, hábitos registrados y su progreso, rutinas de fitness, metas de ahorro, plan de comidas, inventario de cocina, información de pago (procesada por Stripe, no almacenada por nosotros), y datos de uso de la aplicación.',
    },
    {
      heading: '2. Cómo usamos tus datos',
      body: 'Utilizamos tu información exclusivamente para: proveer y mejorar el servicio de Episodio Uno, personalizar tu experiencia en la aplicación, enviarte notificaciones relacionadas con el servicio (recordatorios, avisos de suscripción), y responder a tus solicitudes de soporte.',
    },
    {
      heading: '3. Compartición de datos',
      body: 'No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales. Únicamente compartimos información con: Supabase (proveedor de base de datos y autenticación), Stripe (procesamiento de pagos), y Resend (envío de correos transaccionales). Estos proveedores están sujetos a sus propias políticas de privacidad.',
    },
    {
      heading: '4. Almacenamiento y seguridad',
      body: 'Tus datos se almacenan en servidores seguros de Supabase con cifrado en tránsito (HTTPS/TLS) y en reposo. Implementamos medidas técnicas y organizativas razonables para proteger tu información.',
    },
    {
      heading: '5. Tus derechos (LFPDPPP)',
      body: 'De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP), tienes derecho a: Acceder a tus datos personales, Rectificar datos inexactos, Cancelar (eliminar) tu información, Oponerte al tratamiento de tus datos. Para ejercer cualquiera de estos derechos, escríbenos a noreply@episodiouno.com. Responderemos en un plazo máximo de 20 días hábiles.',
    },
    {
      heading: '6. Eliminación de datos',
      body: 'Puedes solicitar la eliminación completa de tu cuenta y datos en cualquier momento escribiendo a noreply@episodiouno.com con el asunto "Eliminar mi cuenta". Procesaremos tu solicitud en un plazo de 5 días hábiles.',
    },
    {
      heading: '7. Cookies y sesiones',
      body: 'Utilizamos cookies y almacenamiento local del navegador para mantener tu sesión activa y guardar preferencias de la aplicación. No utilizamos cookies de rastreo o publicidad.',
    },
    {
      heading: '8. Cambios a esta política',
      body: 'Podemos actualizar esta Política de Privacidad. Te notificaremos sobre cambios significativos por correo electrónico. La versión vigente siempre estará disponible en episodiouno.com.',
    },
    {
      heading: '9. Contacto',
      body: 'Para cualquier pregunta sobre privacidad o para ejercer tus derechos: noreply@episodiouno.com — Episodio Uno · episodiouno.com',
    },
  ],
}

export default function LegalModal({ type, onClose }) {
  const doc = type === 'terms' ? TERMS : PRIVACY

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: '#111', border: '1px solid rgba(0,212,255,.2)',
        borderRadius: 16, width: '100%', maxWidth: 640,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(0,212,255,.05)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #1e1e1e', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#efefed' }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Episodio Uno · episodiouno.com</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,.06)', border: '1px solid #2a2a2a',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#888', fontSize: 18, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <p style={{ fontSize: 12, color: '#444', marginBottom: 20, lineHeight: 1.6 }}>
            Última actualización: enero 2026 · Vigente para usuarios de episodiouno.com
          </p>
          {doc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#00D4FF', marginBottom: 6 }}>
                {s.heading}
              </div>
              <p style={{ fontSize: 13, color: '#8a8a85', lineHeight: 1.75, margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #1e1e1e', flexShrink: 0,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0,212,255,.12)', border: '1px solid rgba(0,212,255,.3)',
              color: '#00D4FF', borderRadius: 8, padding: '8px 20px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
