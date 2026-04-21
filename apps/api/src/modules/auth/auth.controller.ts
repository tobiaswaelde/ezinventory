import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator.js';
import { AuthService } from '~/modules/auth/auth.service.js';
import { LoginDto } from '~/modules/auth/dto/login.dto.js';
import { PasskeyLoginOptionsDto } from '~/modules/auth/dto/passkey-login-options.dto.js';
import { PasskeyLoginVerifyDto } from '~/modules/auth/dto/passkey-login-verify.dto.js';
import { PasskeyRegisterOptionsDto } from '~/modules/auth/dto/passkey-register-options.dto.js';
import { PasskeyRegisterVerifyDto } from '~/modules/auth/dto/passkey-register-verify.dto.js';
import { RefreshTokenDto } from '~/modules/auth/dto/refresh-token.dto.js';
import { RegisterDto } from '~/modules/auth/dto/register.dto.js';
import { UpdatePreferredLanguageDto } from '~/modules/auth/dto/update-preferred-language.dto.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', example: 'admin@example.com' },
        role: { type: 'string', example: 'ADMIN' },
        preferredLanguage: { type: 'string', enum: ['de', 'en'], example: 'en' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return await this.authService.me(user.id);
  }

  @Patch('me/language')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update preferred language for current user' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        preferredLanguage: { type: 'string', enum: ['de', 'en'], example: 'de' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Validation failed for preferred language.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async updatePreferredLanguage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePreferredLanguageDto
  ): Promise<{ id: string; preferredLanguage: 'de' | 'en' }> {
    return await this.authService.updatePreferredLanguage(user.id, dto.preferredLanguage);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account with password credentials' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for registration payload.' })
  async register(@Body() dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'jwt-access-token' },
        refreshToken: { type: 'string', example: 'jwt-refresh-token' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Validation failed for login payload.' })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.login(dto);
  }

  @Post('passkeys/register-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start passkey registration and return browser options' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for passkey register options payload.' })
  async passkeyRegisterOptions(
    @Body() dto: PasskeyRegisterOptionsDto
  ): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
    return await this.authService.passkeyRegisterOptions(dto);
  }

  @Post('passkeys/register-verify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Verify passkey registration response and persist credential' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for passkey register verification payload.' })
  async passkeyRegisterVerify(
    @Body() dto: PasskeyRegisterVerifyDto
  ): Promise<{ verified: true; credentialId: string; email: string }> {
    return await this.authService.passkeyRegisterVerify(dto);
  }

  @Post('passkeys/login-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start passkey login and return browser options' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for passkey login options payload.' })
  async passkeyLoginOptions(
    @Body() dto: PasskeyLoginOptionsDto
  ): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
    return await this.authService.passkeyLoginOptions(dto);
  }

  @Post('passkeys/login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify passkey login response and issue tokens' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for passkey login verification payload.' })
  async passkeyLoginVerify(@Body() dto: PasskeyLoginVerifyDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.passkeyLoginVerify(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new token pair' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for refresh payload.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    return await this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate refresh token session' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        loggedOut: { type: 'boolean', example: true }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Validation failed for logout payload.' })
  async logout(@Body() dto: RefreshTokenDto): Promise<{ loggedOut: true }> {
    return await this.authService.logout(dto);
  }
}
