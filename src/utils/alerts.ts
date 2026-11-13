/* ============================================
   UTILIDADES DE ALERTAS — SWEETALERT2
   FiscalHost Inteligente CR — Serene Tax System
   ============================================ */

import Swal from 'sweetalert2';
import type { SweetAlertOptions, SweetAlertResult, SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/**
 * Base SweetAlert2 instance configured with Serene Tax styling
 */
export const SereneSwal = Swal.mixin({
  customClass: {
    popup: 'serene-swal-popup',
    title: 'serene-swal-title',
    htmlContainer: 'serene-swal-html',
    confirmButton: 'serene-swal-confirm',
    cancelButton: 'serene-swal-cancel',
    denyButton: 'serene-swal-deny',
  },
  buttonsStyling: false,
});

/**
 * Toast instance for non-intrusive feedback
 */
export const ToastSwal = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  customClass: {
    popup: 'serene-toast-popup',
    title: 'serene-toast-title',
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

/**
 * Parses diverse backend error payloads:
 * - RFC 7807 ProblemDetails (detail, title, extensions)
 * - ASP.NET Core ModelState error dictionary ({ errors: { Field: ["Msg"] } })
 * - Custom backend message structures ({ mensaje: "..." } or { message: "..." })
 * - Raw string messages
 */
export function extractErrorMessage(data: unknown, defaultMessage?: string): string {
  const fallback = defaultMessage || 'Ocurrió un error al procesar la solicitud.';
  if (!data) return fallback;
  if (typeof data === 'string' && data.trim()) return data;

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    // 1. ProblemDetails detail
    if (typeof obj.detail === 'string' && obj.detail.trim()) {
      return obj.detail;
    }

    // 2. Custom backend message formats
    if (typeof obj.mensaje === 'string' && obj.mensaje.trim()) {
      return obj.mensaje;
    }
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }

    // 3. ASP.NET Core ModelState error dictionary: { errors: { [field]: string[] } }
    if (obj.errors && typeof obj.errors === 'object') {
      const messages: string[] = [];
      const errorsObj = obj.errors as Record<string, unknown>;
      for (const key of Object.keys(errorsObj)) {
        const val = errorsObj[key];
        if (Array.isArray(val)) {
          messages.push(...val.filter((v): v is string => typeof v === 'string' && Boolean(v.trim())));
        } else if (typeof val === 'string' && val.trim()) {
          messages.push(val);
        }
      }
      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    // 4. Fallback to ProblemDetails title
    if (typeof obj.title === 'string' && obj.title.trim()) {
      return obj.title;
    }

    // 5. Single 'error' field
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error;
    }
  }

  return fallback;
}

/**
 * Display a success modal dialog
 */
export function showSuccess(
  title: string,
  text?: string,
  options?: SweetAlertOptions
): Promise<SweetAlertResult> {
  return SereneSwal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Aceptar',
    ...options,
  });
}

/**
 * Display an error modal dialog
 */
export function showError(
  title: string,
  text?: string,
  options?: SweetAlertOptions
): Promise<SweetAlertResult> {
  return SereneSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
    ...options,
  });
}

/**
 * Display a warning modal dialog
 */
export function showWarning(
  title: string,
  text?: string,
  options?: SweetAlertOptions
): Promise<SweetAlertResult> {
  return SereneSwal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Aceptar',
    ...options,
  });
}

/**
 * Display an informational modal dialog
 */
export function showInfo(
  title: string,
  text?: string,
  options?: SweetAlertOptions
): Promise<SweetAlertResult> {
  return SereneSwal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Aceptar',
    ...options,
  });
}

/**
 * Display a confirmation prompt returning a SweetAlertResult
 */
export function showConfirm(
  title: string,
  text: string = '',
  confirmButtonText: string = 'Confirmar',
  cancelButtonText: string = 'Cancelar',
  icon: SweetAlertIcon = 'question'
): Promise<SweetAlertResult> {
  return SereneSwal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });
}

/**
 * Display a lightweight toast alert
 */
export function showToast(
  title: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'success'
): Promise<SweetAlertResult> {
  return ToastSwal.fire({
    icon,
    title,
  });
}

export { Swal };
export default SereneSwal;
