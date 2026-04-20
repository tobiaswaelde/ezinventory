import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto.js';
import { PasskeyLoginOptionsDto } from './dto/passkey-login-options.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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
  login(@Body() dto: LoginDto): { accessToken: string; refreshToken: string; email: string } {
    return {
      accessToken: 'jwt-access-token',
      refreshToken: 'jwt-refresh-token',
      email: dto.email
    };
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
  passkeyLoginOptions(@Body() dto: PasskeyLoginOptionsDto): { challenge: string; rpId: string; email: string } {
    return {
      challenge: 'base64url-challenge',
      rpId: 'localhost',
      email: dto.email
    };
  }
}
