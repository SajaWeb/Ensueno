import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class UserRepository {
  /**
   * Busca usuario por Email con su perfil de mamá y bebés
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        motherProfile: {
          include: {
            babies: true,
          },
        },
      },
    });
  }

  /**
   * Registra un nuevo usuario con hashing seguro bcrypt y perfil inicial
   */
  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    babyName?: string;
    babyBirthDate?: Date;
    expectedDueDate?: Date;
    skinCondition?: string;
    role?: 'ADMIN' | 'CUSTOMER';
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role || 'CUSTOMER',
        motherProfile: {
          create: {
            fullName: data.fullName,
            phone: data.phone,
            babies: data.babyName
              ? {
                  create: [
                    {
                      babyName: data.babyName,
                      birthDate: data.babyBirthDate,
                      expectedDueDate: data.expectedDueDate,
                      skinCondition: data.skinCondition || 'Normal',
                    },
                  ],
                }
              : undefined,
          },
        },
      },
      include: {
        motherProfile: {
          include: {
            babies: true,
          },
        },
      },
    });
  }

  /**
   * Verifica la contraseña del usuario
   */
  async verifyPassword(plainText: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainText, passwordHash);
  }

  /**
   * Genera un token único de restablecimiento de contraseña con expiración de 1 hora
   */
  async createPasswordResetToken(userId: string) {
    // Invalida tokens anteriores
    await prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Valida token y actualiza la contraseña del usuario
   */
  async resetPasswordWithToken(token: string, newPassword: string) {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return { success: false, error: 'Token inválido o expirado' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return { success: true, user: resetRecord.user };
  }

  /**
   * Actualiza el perfil de la mamá y sus bebés
   */
  async updateProfile(
    userId: string,
    motherData: { fullName?: string; phone?: string; city?: string; department?: string; address?: string },
    babyData?: { id?: string; babyName: string; birthDate?: Date; expectedDueDate?: Date; skinCondition?: string }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { motherProfile: true },
    });

    if (!user || !user.motherProfile) {
      throw new Error('Perfil de usuario no encontrado');
    }

    const updatedMother = await prisma.motherProfile.update({
      where: { id: user.motherProfile.id },
      data: motherData,
    });

    if (babyData) {
      if (babyData.id) {
        await prisma.babyProfile.update({
          where: { id: babyData.id },
          data: {
            babyName: babyData.babyName,
            birthDate: babyData.birthDate,
            expectedDueDate: babyData.expectedDueDate,
            skinCondition: babyData.skinCondition,
          },
        });
      } else {
        await prisma.babyProfile.create({
          data: {
            motherId: updatedMother.id,
            babyName: babyData.babyName,
            birthDate: babyData.birthDate,
            expectedDueDate: babyData.expectedDueDate,
            skinCondition: babyData.skinCondition || 'Normal',
          },
        });
      }
    }

    return this.findByEmail(user.email);
  }
}

export const userRepository = new UserRepository();
