import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { PasskeyLoginOptionsDto } from './dto/passkey-login-options.dto.js';
import { PasskeyLoginVerifyDto } from './dto/passkey-login-verify.dto.js';
import { PasskeyRegisterOptionsDto } from './dto/passkey-register-options.dto.js';
import { PasskeyRegisterVerifyDto } from './dto/passkey-register-verify.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

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
}
