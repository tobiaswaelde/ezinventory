import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { ApiAuth, ApiTag } from '~/config/api';
import { ApiErrorResponses } from '~/decorators/responses/api-error-responses.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { MfaService } from '~/modules/auth/mfa/mfa.service';
import { AuthRequest } from '~/types/auth-request';
import { ErrorCode } from '~/types/error-code';
import { MfaEnableDTO } from '~/types/modules/auth/mfa/mfa-enable.dto';
import { MfaSetupDTO } from '~/types/modules/auth/mfa/mfa-setup.dto';
import { MfaVerifyDTO } from '~/types/modules/auth/mfa/mfa-verify.dto';
import { UserDTO } from '~/types/modules/user/user.dto';

@ApiTags(ApiTag.AuthMfa)
@Controller(ApiTag.AuthMfa)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ApiAuth.JWT)
@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
export class MfaController {
  constructor(@Inject(MfaService.token) private readonly mfaService: MfaService) {}

  @Get('/')
  @ApiOperation({ summary: 'Request MFA secret & QR code for setup' })
  @ApiOkResponse({ description: 'Data for MFA setup', type: MfaSetupDTO })
  @ApiErrorResponses({
    notFoundCodes: [ErrorCode.UserNotFound],
    conflictCodes: [ErrorCode.AuthMfaAlreadyEnabled],
  })
  async requestMfa(@Req() req: AuthRequest) {
    const res = await this.mfaService.requestMfa(req.user.id);
    return instanceToPlain(new MfaSetupDTO(res));
  }

  @Post('/enable')
  @ApiOperation({ summary: 'Enable MFA for the current user' })
  @ApiOkResponse({ description: 'MFA enabled, returns updated user', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.AuthMfaInvalidCode],
    notFoundCodes: [ErrorCode.UserNotFound],
    conflictCodes: [ErrorCode.AuthMfaAlreadyEnabled],
  })
  async enableMfa(@Req() req: AuthRequest, @Body() data: MfaEnableDTO) {
    const user = await this.mfaService.enableMfa(req.user.id, data);
    return instanceToPlain(UserDTO.fromModel(user));
  }

  @Post('/disable')
  @ApiOperation({ summary: 'Disable MFA for the current user' })
  @ApiOkResponse({ description: 'MFA disabled, returns updated user', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.AuthMfaInvalidCode],
    notFoundCodes: [ErrorCode.UserNotFound],
    conflictCodes: [ErrorCode.AuthMfaNotEnabled],
  })
  async disableMfa(@Req() req: AuthRequest, @Body() data: MfaVerifyDTO) {
    if (!data) {
      throw new ForbiddenException(ErrorCode.AuthMfaInvalidCode);
    }

    const user = await this.mfaService.disableMfa(req.user.id, data);
    return instanceToPlain(UserDTO.fromModel(user));
  }
}
