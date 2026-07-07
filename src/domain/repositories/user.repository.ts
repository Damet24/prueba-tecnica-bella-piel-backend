import { User } from '../user.entity';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Pick<User, 'nombre' | 'email' | 'password'>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User | null>;
  softDelete(id: number): Promise<boolean>;
}
