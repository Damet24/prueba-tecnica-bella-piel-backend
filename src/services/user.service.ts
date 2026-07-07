import { UserRepository } from '../domain/repositories/user.repository';
import { User, PublicUser } from '../domain/user.entity';
import { TaskNotFoundError, EmailAlreadyExistsError, ForbiddenError } from '../domain/errors';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(): Promise<PublicUser[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.toPublicUser);
  }

  async getById(id: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new TaskNotFoundError(`User with id ${id} not found`);
    return this.toPublicUser(user);
  }

  async create(data: { nombre: string; email: string; password: string; rol: User['rol'] }): Promise<PublicUser> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new EmailAlreadyExistsError(data.email);

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      nombre: data.nombre,
      email: data.email,
      password: hashedPassword,
    });

    await this.userRepository.update(user.id, { rol: data.rol });

    const updated = await this.userRepository.findById(user.id) as User;
    return this.toPublicUser(updated);
  }

  async update(id: number, data: Partial<Pick<User, 'nombre' | 'email' | 'rol'>>): Promise<PublicUser> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new TaskNotFoundError(`User with id ${id} not found`);

    if (data.email && data.email !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(data.email);
      if (emailTaken) throw new EmailAlreadyExistsError(data.email);
    }

    const updateData: Partial<User> = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.rol !== undefined) updateData.rol = data.rol;

    const updated = await this.userRepository.update(id, updateData);
    return this.toPublicUser(updated as User);
  }

  async getDeleted(): Promise<PublicUser[]> {
    const users = await this.userRepository.findDeleted();
    return users.map(this.toPublicUser);
  }

  async restore(id: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);
    if (user) throw new ForbiddenError(`User with id ${id} is not deleted`);

    const restored = await this.userRepository.restore(id);
    if (!restored) throw new TaskNotFoundError(`User with id ${id} not found`);

    const result = await this.userRepository.findById(id) as User;
    return this.toPublicUser(result);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new TaskNotFoundError(`User with id ${id} not found`);

    await this.userRepository.softDelete(id);
  }

  private toPublicUser(user: User): PublicUser {
    const { password: _, ...publicUser } = user;
    return publicUser;
  }
}
