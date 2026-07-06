export interface Task {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en progreso' | 'completada';
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  fecha_eliminacion?: Date | null;
}
