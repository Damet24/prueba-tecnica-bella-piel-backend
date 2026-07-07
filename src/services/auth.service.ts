import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../domain/repositories/user.repository';
import { User, PublicUser } from '../domain/user.entity';
import { InvalidCredentialsError, EmailAlreadyExistsError } from '../domain/errors';
import { env } from '../config/env.config';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(data: { nombre: string; email: string; password: string }): Promise<PublicUser> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new EmailAlreadyExistsError(data.email);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      nombre: data.nombre,
      email: data.email,
      password: hashedPassword,
    });
    return this.toPublicUser(user);
  }

  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new InvalidCredentialsError();

    const expiresInSeconds = 24 * 60 * 60;
    const token = jwt.sign({ id: user.id, rol: user.rol }, env.jwt.secret, {
      expiresIn: expiresInSeconds,
    });

    return { user: this.toPublicUser(user), token };
  }

  async me(userId: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new InvalidCredentialsError();
    return this.toPublicUser(user);
  }

  async updateProfile(userId: number, data: { nombre?: string; email?: string }): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new InvalidCredentialsError();

    if (data.email && data.email !== user.email) {
      const emailTaken = await this.userRepository.findByEmail(data.email);
      if (emailTaken) throw new EmailAlreadyExistsError(data.email);
    }

    const updateData: Partial<User> = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;

    const updated = await this.userRepository.update(userId, updateData);
    return this.toPublicUser(updated as User);
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new InvalidCredentialsError();

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  private toPublicUser(user: User): PublicUser {
    const { password: _, ...publicUser } = user;
    return publicUser;
  }
}
