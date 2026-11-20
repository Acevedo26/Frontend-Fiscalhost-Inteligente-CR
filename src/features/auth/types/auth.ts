export interface LoginRequest {
  /** Format: email */
  correo: string;
  contrasena: string;
}

export interface RegistroRequest {
  nombreCompleto: string;
  /** @nullable */
  nombre?: string | null;
  /** Format: email */
  correoElectronico: string;
  /** @nullable */
  correo?: string | null;
  contrasena: string;
  /** @nullable */
  clave?: string | null;
  numeroIdentificacion: string;
  /** @nullable */
  identificacion?: string | null;
  tipoIdentificacion: string;
  /** @nullable */
  razonSocial?: string | null;
}

export interface UsuarioInfo {
  id?: string;
  nombreCompleto?: string;
  nombre?: string;
  correoElectronico?: string;
  correo?: string;
  email?: string;
  rol?: string;
  tipoIdentificacion?: string;
  identificacion?: string;
  numeroIdentificacion?: string;
}

export interface LoginResponse {
  token: string;
  mensaje?: string;
  usuario?: UsuarioInfo;
}

export interface RegistroResponse {
  id?: string;
  usuarioId?: string;
  correo?: string;
  correoElectronico?: string;
  mensaje?: string;
}

export interface AuthResponse {
  token: string;
  usuario: UsuarioInfo;
}
