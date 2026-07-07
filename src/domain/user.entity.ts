export type UserRol = 'usuario' | 'admin';

export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: UserRol;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  fecha_eliminacion?: Date | null;
}

export type PublicUser = Omit<User, 'password'>;
