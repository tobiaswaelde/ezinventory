import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { PasskeyLoginOptionsDto } from './dto/passkey-login-options.dto.js';

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

  @Post('passkeys/login-options')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        challenge: { type: 'string', example: 'base64url-challenge' },
        rpId: { type: 'string', example: 'localhost' }
      }
    }
  })
  async passkeyLoginOptions(@Body() dto: PasskeyLoginOptionsDto): Promise<{ challenge: string; rpId: string; email: string }> {
    return await this.authService.passkeyLoginOptions(dto);
  }
}
