export interface LoginRequest {
  correo?: string;
  email?: string;
  clave?: string;
  password?: string;
  contrasena?: string;
}

export interface RegistroRequest {
  nombre?: string;
  nombreCompleto?: string;
  correo?: string;
  correoElectronico?: string;
  email?: string;
  clave?: string;
  password?: string;
  contrasena?: string;
  identificacion?: string;
  numeroIdentificacion?: string;
  tipoIdentificacion?: string;
  razonSocial?: string;
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
