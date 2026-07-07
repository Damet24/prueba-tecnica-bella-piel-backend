export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  fecha_eliminacion?: Date | null;
}
