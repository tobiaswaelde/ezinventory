import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { AuthService } from '~/modules/auth/auth.service.js';
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator.js';
import { LoginDto } from '~/modules/auth/dto/login.dto.js';
import { PasskeyLoginOptionsDto } from '~/modules/auth/dto/passkey-login-options.dto.js';
import { PasskeyLoginVerifyDto } from '~/modules/auth/dto/passkey-login-verify.dto.js';
import { PasskeyRegisterOptionsDto } from '~/modules/auth/dto/passkey-register-options.dto.js';
import { PasskeyRegisterVerifyDto } from '~/modules/auth/dto/passkey-register-verify.dto.js';
import { RefreshTokenDto } from '~/modules/auth/dto/refresh-token.dto.js';
import { RegisterDto } from '~/modules/auth/dto/register.dto.js';
import {
  AuthenticatedUserDto,
  AuthTokensResponseDto,
  DeletePasskeyResponseDto,
  LogoutResponseDto,
  PasskeyListItemResponseDto,
  PasskeyOptionsResponseDto,
  PasskeyRegisterVerifyResponseDto,
  UpdatePreferredLanguageResponseDto
} from '~/modules/auth/dto/auth-response.dto.js';
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
  @ApiOkResponse({ type: AuthenticatedUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUserDto> {
    const me = await this.authService.me(user.id);
    return AuthenticatedUserDto.fromModel(me);
  }

  @Patch('me/language')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update preferred language for current user' })
  @ApiOkResponse({ type: UpdatePreferredLanguageResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for preferred language.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async updatePreferredLanguage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePreferredLanguageDto
  ): Promise<UpdatePreferredLanguageResponseDto> {
    const updated = await this.authService.updatePreferredLanguage(user.id, dto.preferredLanguage);
    return UpdatePreferredLanguageResponseDto.fromModel(updated);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account with password credentials' })
  @ApiCreatedResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for registration payload.' })
  async register(@Body() dto: RegisterDto): Promise<AuthTokensResponseDto> {
    const auth = await this.authService.register(dto);
    return AuthTokensResponseDto.fromModel(auth);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for login payload.' })
  async login(@Body() dto: LoginDto): Promise<AuthTokensResponseDto> {
    const auth = await this.authService.login(dto);
    return AuthTokensResponseDto.fromModel(auth);
  }

  @Post('passkeys/register-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start passkey registration and return browser options' })
  @ApiOkResponse({ type: PasskeyOptionsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for passkey register options payload.' })
  async passkeyRegisterOptions(@Body() dto: PasskeyRegisterOptionsDto): Promise<PasskeyOptionsResponseDto> {
    const options = await this.authService.passkeyRegisterOptions(dto);
    return PasskeyOptionsResponseDto.fromModel(options);
  }

  @Post('passkeys/register-verify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Verify passkey registration response and persist credential' })
  @ApiCreatedResponse({ type: PasskeyRegisterVerifyResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for passkey register verification payload.' })
  async passkeyRegisterVerify(
    @Body() dto: PasskeyRegisterVerifyDto
  ): Promise<PasskeyRegisterVerifyResponseDto> {
    const result = await this.authService.passkeyRegisterVerify(dto);
    return PasskeyRegisterVerifyResponseDto.fromModel(result);
  }

  @Post('passkeys/login-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start passkey login and return browser options' })
  @ApiOkResponse({ type: PasskeyOptionsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for passkey login options payload.' })
  async passkeyLoginOptions(@Body() dto: PasskeyLoginOptionsDto): Promise<PasskeyOptionsResponseDto> {
    const options = await this.authService.passkeyLoginOptions(dto);
    return PasskeyOptionsResponseDto.fromModel(options);
  }

  @Post('passkeys/login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify passkey login response and issue tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for passkey login verification payload.' })
  async passkeyLoginVerify(@Body() dto: PasskeyLoginVerifyDto): Promise<AuthTokensResponseDto> {
    const auth = await this.authService.passkeyLoginVerify(dto);
    return AuthTokensResponseDto.fromModel(auth);
  }

  @Get('passkeys')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List passkeys for current authenticated user' })
  @ApiOkResponse({ type: PasskeyListItemResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async listPasskeys(@CurrentUser() user: AuthenticatedUser): Promise<PasskeyListItemResponseDto[]> {
    const items = await this.authService.listPasskeys(user.id);
    return PasskeyListItemResponseDto.fromModels(items);
  }

  @Delete('passkeys/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a passkey for current authenticated user' })
  @ApiOkResponse({ type: DeletePasskeyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async deletePasskey(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<DeletePasskeyResponseDto> {
    const result = await this.authService.deletePasskey(user.id, id);
    return DeletePasskeyResponseDto.fromModel(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new token pair' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for refresh payload.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    const auth = await this.authService.refresh(dto);
    return AuthTokensResponseDto.fromModel(auth);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate refresh token session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for logout payload.' })
  async logout(@Body() dto: RefreshTokenDto): Promise<LogoutResponseDto> {
    const result = await this.authService.logout(dto);
    return LogoutResponseDto.fromModel(result);
  }
}
