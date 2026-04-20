import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import argon2 from 'argon2';

import { BootstrapAdminDto } from '~/modules/setup/dto/bootstrap-admin.dto.js';
import { RegistrationMode, UpdateRegistrationModeDto } from '~/modules/setup/dto/update-registration-mode.dto.js';
import { REGISTRATION_MODE_KEY, SETUP_INITIALIZED_KEY } from '~/modules/setup/setup.constants.js';
import { PrismaService } from '~/prisma/prisma.service.js';

@Injectable()
export class SetupService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async bootstrapAdmin(dto: BootstrapAdminDto): Promise<{ setupInitialized: true; adminUserId: string; email: string }> {
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });

    if (existingAdmin) {
      throw new ConflictException('Initial setup is already completed.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const admin = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        displayName: dto.displayName,
        passwordHash,
        role: UserRole.ADMIN,
        preferredLanguage: 'en'
      },
      select: {
        id: true,
        email: true
      }
    });

    await this.prisma.systemSetting.upsert({
      where: { key: SETUP_INITIALIZED_KEY },
      update: { value: true },
      create: { key: SETUP_INITIALIZED_KEY, value: true }
    });

    await this.prisma.systemSetting.upsert({
      where: { key: REGISTRATION_MODE_KEY },
      update: { value: RegistrationMode.ADMIN_ONLY },
      create: { key: REGISTRATION_MODE_KEY, value: RegistrationMode.ADMIN_ONLY }
    });

    return {
      setupInitialized: true,
      adminUserId: admin.id,
      email: admin.email
    };
  }

  async updateRegistrationMode(dto: UpdateRegistrationModeDto): Promise<{ mode: RegistrationMode }> {
    const initialized = await this.prisma.systemSetting.findUnique({
      where: { key: SETUP_INITIALIZED_KEY }
    });

    if (!initialized || initialized.value !== true) {
      throw new NotFoundException('Setup is not initialized yet.');
    }

    await this.prisma.systemSetting.upsert({
      where: { key: REGISTRATION_MODE_KEY },
      update: { value: dto.mode },
      create: { key: REGISTRATION_MODE_KEY, value: dto.mode }
    });

    return { mode: dto.mode };
  }
}
