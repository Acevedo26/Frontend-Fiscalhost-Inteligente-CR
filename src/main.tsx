import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SereneSwal } from './utils/alerts'
import './styles/alerts.css'

async function init() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('No se encontró el elemento #root en el DOM.')
    return
  }

  try {
    // Importación dinámica para capturar errores de configuración a nivel
    // de módulo (por ejemplo, VITE_API_URL no definida en axiosClient.ts)
    // antes de montar la aplicación y evitar pantalla en blanco.
    const { default: App } = await import('./App.tsx')

    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error: unknown) {
    console.error('Error al inicializar la aplicación:', error)

    // Usar SweetAlert2 con el estilo de la página (SereneSwal + alerts.css)
    // en lugar de renderizar un componente React custom, para evitar
    // pantallas en blanco y mantener el diseño consistente.
    const result = await SereneSwal.fire({
      icon: 'error',
      title: 'Sistema no disponible',
      html: `
        <p style="margin: 0 0 1rem 0; color: var(--color-text-secondary, #5a6270); font-size: 0.95rem;">
          La aplicación no está configurada correctamente para funcionar.
        </p>
        <p style="margin: 0; color: var(--color-text-primary, #1a1f2e); font-size: 0.95rem;">
          Contacte al administrador del sistema.
        </p>
      `,
      confirmButtonText: 'Reintentar',
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      customClass: {
        popup: 'serene-swal-popup',
        title: 'serene-swal-title',
        htmlContainer: 'serene-swal-html',
        confirmButton: 'serene-swal-confirm',
      },
      buttonsStyling: false,
    })

    if (result.isConfirmed) {
      window.location.reload()
    }
  }
}

init()
