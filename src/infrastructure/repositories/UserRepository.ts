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
   * Registra un nuevo usuario con hashing seguro bcrypt, código de verificación e información inicial
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
    verificationCode?: string;
    verificationExpires?: Date;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role || 'CUSTOMER',
        verificationCode: data.verificationCode,
        verificationExpires: data.verificationExpires,
        emailVerified: false,
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
   * Genera y asigna un nuevo código de verificación de 6 dígitos al usuario
   */
  async generateVerificationCode(userId: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: code,
        verificationExpires: expiresAt,
      },
    });

    return code;
  }

  /**
   * Valida el código de confirmación de correo
   */
  async verifyEmailCode(email: string, code: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.emailVerified) {
      return { success: true, message: 'El correo ya se encuentra verificado', user };
    }

    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return { success: false, error: 'Código de verificación incorrecto' };
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return { success: false, error: 'El código de verificación ha expirado. Solicita uno nuevo.' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
      include: {
        motherProfile: {
          include: {
            babies: true,
          },
        },
      },
    });

    return { success: true, user: updatedUser };
  }

  /**
   * Verifica la contraseña del usuario
   */
  async verifyPassword(plainText: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainText, passwordHash);
  }

  /**
   * Genera un código de 6 dígitos único para restablecer contraseña
   */
  async createPasswordResetToken(userId: string) {
    // Invalida tokens anteriores
    await prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    return prisma.passwordResetToken.create({
      data: {
        userId,
        token: code,
        expiresAt,
      },
    });
  }

  /**
   * Valida código de 6 dígitos o token y actualiza la contraseña del usuario
   */
  async resetPasswordWithToken(emailOrToken: string, codeOrToken: string, newPassword?: string) {
    // Acepta parámetros sobrecargados (token, newPassword) o (email, code, newPassword)
    let searchToken = codeOrToken;
    let actualNewPassword = newPassword;

    if (!newPassword) {
      searchToken = emailOrToken;
      actualNewPassword = codeOrToken;
    }

    let resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: searchToken.trim() },
      include: { user: true },
    });

    // Si se buscó por correo y código
    if (!resetRecord && emailOrToken && searchToken) {
      const user = await this.findByEmail(emailOrToken);
      if (user) {
        resetRecord = await prisma.passwordResetToken.findFirst({
          where: {
            userId: user.id,
            token: searchToken.trim(),
            used: false,
          },
          include: { user: true },
        });
      }
    }

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return { success: false, error: 'Código de seguridad inválido o expirado' };
    }

    if (!actualNewPassword || actualNewPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    const passwordHash = await bcrypt.hash(actualNewPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash,
          emailVerified: true, // Auto-verifica correo al cambiar contraseña exitosamente
        },
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
