import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtOptions } from '~/config/jwt';
import { AuthController } from '~/modules/auth/auth.controller';
import { AuthService } from '~/modules/auth/auth.service';
import { JwtStrategy } from '~/modules/auth/jwt.strategy';
import { LocalStrategy } from '~/modules/auth/local.strategy';
import { MfaController } from '~/modules/auth/mfa/mfa.controller';
import { MfaService } from '~/modules/auth/mfa/mfa.service';
import { PasswordController } from '~/modules/auth/password/password.controller';
import { PasswordService } from '~/modules/auth/password/password.service';
import { UsersService } from '~/modules/users/users.service';

@Module({
  imports: [PassportModule, JwtModule.registerAsync(jwtOptions)],
  providers: [
    { provide: LocalStrategy.token, useClass: LocalStrategy },
    { provide: JwtStrategy.token, useClass: JwtStrategy },
    { provide: AuthService.token, useClass: AuthService },
    { provide: PasswordService.token, useClass: PasswordService },
    { provide: UsersService.token, useClass: UsersService },
    { provide: MfaService.token, useClass: MfaService },
  ],
  controllers: [AuthController, PasswordController, MfaController],
})
export class AuthModule {}
