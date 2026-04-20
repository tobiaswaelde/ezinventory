import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator.js';
import { AuthService } from '~/modules/auth/auth.service.js';
import { LoginDto } from '~/modules/auth/dto/login.dto.js';
import { PasskeyLoginOptionsDto } from '~/modules/auth/dto/passkey-login-options.dto.js';
import { PasskeyLoginVerifyDto } from '~/modules/auth/dto/passkey-login-verify.dto.js';
import { PasskeyRegisterOptionsDto } from '~/modules/auth/dto/passkey-register-options.dto.js';
import { PasskeyRegisterVerifyDto } from '~/modules/auth/dto/passkey-register-verify.dto.js';
import { RefreshTokenDto } from '~/modules/auth/dto/refresh-token.dto.js';
import { RegisterDto } from '~/modules/auth/dto/register.dto.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('bearer')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', example: 'admin@example.com' },
        role: { type: 'string', example: 'ADMIN' }
      }
    }
  })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return await this.authService.me(user.id);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'jwt-access-token' },
        refreshToken: { type: 'string', example: 'jwt-refresh-token' },
        email: { type: 'string', example: 'new.user@example.com' }
      }
    }
  })
  async register(@Body() dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'jwt-access-token' },
        refreshToken: { type: 'string', example: 'jwt-refresh-token' }
      }
    }
  })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.login(dto);
  }

  @Post('passkeys/register-options')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        challenge: { type: 'string', example: 'base64url-challenge' },
        options: { type: 'object' },
        email: { type: 'string', example: 'admin@example.com' }
      }
    }
  })
  async passkeyRegisterOptions(
    @Body() dto: PasskeyRegisterOptionsDto
  ): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
    return await this.authService.passkeyRegisterOptions(dto);
  }

  @Post('passkeys/register-verify')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        verified: { type: 'boolean', example: true },
        credentialId: { type: 'string', example: 'credential-base64url-id' },
        email: { type: 'string', example: 'admin@example.com' }
      }
    }
  })
  async passkeyRegisterVerify(
    @Body() dto: PasskeyRegisterVerifyDto
  ): Promise<{ verified: true; credentialId: string; email: string }> {
    return await this.authService.passkeyRegisterVerify(dto);
  }

  @Post('passkeys/login-options')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        challenge: { type: 'string', example: 'base64url-challenge' },
        options: { type: 'object' },
        email: { type: 'string', example: 'admin@example.com' }
      }
    }
  })
  async passkeyLoginOptions(
    @Body() dto: PasskeyLoginOptionsDto
  ): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
    return await this.authService.passkeyLoginOptions(dto);
  }

  @Post('passkeys/login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'jwt-access-token' },
        refreshToken: { type: 'string', example: 'jwt-refresh-token' },
        email: { type: 'string', example: 'admin@example.com' }
      }
    }
  })
  async passkeyLoginVerify(@Body() dto: PasskeyLoginVerifyDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.passkeyLoginVerify(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'jwt-access-token' },
        refreshToken: { type: 'string', example: 'jwt-refresh-token' },
        email: { type: 'string', example: 'admin@example.com' }
      }
    }
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        loggedOut: { type: 'boolean', example: true }
      }
    }
  })
  async logout(@Body() dto: RefreshTokenDto): Promise<{ loggedOut: true }> {
    return await this.authService.logout(dto);
  }
}
