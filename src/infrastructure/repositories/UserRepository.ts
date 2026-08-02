import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/** Intentos fallidos que aguanta un código de recuperación antes de quemarse. */
const MAX_RESET_ATTEMPTS = 5;

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
   * Busca si existe un perfil de mamá registrado con el número de documento
   */
  async findByDocNumber(docNumber: string) {
    if (!docNumber || !docNumber.trim()) return null;
    return prisma.motherProfile.findFirst({
      where: { docNumber: docNumber.trim() },
    });
  }

  /**
   * Busca si existe un perfil de mamá registrado con el teléfono / WhatsApp
   */
  async findByPhone(phone: string) {
    if (!phone || !phone.trim()) return null;
    return prisma.motherProfile.findFirst({
      where: { phone: phone.trim() },
    });
  }

  /**
   * Registra un nuevo usuario con hashing seguro bcrypt, código de verificación e información inicial
   */
  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    docType?: string;
    docNumber?: string;
    phone?: string;
    babyName?: string;
    babyBirthDate?: Date;
    expectedDueDate?: Date;
    skinCondition?: string;
    hasBaby?: boolean;
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
            docType: data.docType || 'CC',
            docNumber: data.docNumber,
            phone: data.phone,
            hasBaby: data.hasBaby !== false,
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

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // `token` es único en toda la tabla, así que dos códigos vivos pueden
    // chocar. Se reintenta en vez de dejar que el 500 le llegue a la usuaria.
    for (let intento = 0; intento < 5; intento++) {
      // randomInt y no Math.random: este código también abre las cuentas de
      // administración.
      const code = crypto.randomInt(100000, 1000000).toString();
      try {
        return await prisma.passwordResetToken.create({
          data: { userId, token: code, expiresAt },
        });
      } catch (err: any) {
        if (err?.code !== 'P2002') throw err; // P2002 = choque de restricción única
      }
    }

    throw new Error('No se pudo generar un código de recuperación disponible');
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

    const cleanToken = searchToken.trim();

    let resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: cleanToken },
      include: { user: true },
    });

    // Si se buscó por correo y código
    if (!resetRecord && emailOrToken && searchToken) {
      const user = await this.findByEmail(emailOrToken);
      if (user) {
        resetRecord = await prisma.passwordResetToken.findFirst({
          where: {
            userId: user.id,
            token: cleanToken,
            used: false,
          },
          include: { user: true },
        });

        // Código equivocado: se le cobra el intento al código vivo de esa
        // cuenta. Sin esto, seis dígitos con una hora de vida se adivinan a
        // fuerza bruta, y desde el panel eso abre cuentas de administración.
        if (!resetRecord) {
          const activo = await prisma.passwordResetToken.findFirst({
            where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
          });

          if (activo) {
            const intentos = activo.attempts + 1;
            await prisma.passwordResetToken.update({
              where: { id: activo.id },
              data: { attempts: intentos, ...(intentos >= MAX_RESET_ATTEMPTS ? { used: true } : {}) },
            });

            if (intentos >= MAX_RESET_ATTEMPTS) {
              return { success: false, error: 'Demasiados intentos fallidos. Solicita un código nuevo.' };
            }
          }
        }
      }
    }

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return { success: false, error: 'Código de seguridad inválido o expirado' };
    }

    if (resetRecord.attempts >= MAX_RESET_ATTEMPTS) {
      await prisma.passwordResetToken.update({ where: { id: resetRecord.id }, data: { used: true } });
      return { success: false, error: 'Demasiados intentos fallidos. Solicita un código nuevo.' };
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
