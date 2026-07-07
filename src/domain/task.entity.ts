export interface Task {
  id: string;
  user_id: number;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en progreso' | 'completada';
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  fecha_eliminacion?: Date | null;
}
