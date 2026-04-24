import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiTag } from '~/config/api';
import { ApiErrorResponses } from '~/decorators/responses/api-error-responses.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PasswordService } from '~/modules/auth/password/password.service';
import { AuthRequest } from '~/types/auth-request';
import { ErrorCode } from '~/types/error-code';
import { UpdatePasswordDTO } from '~/types/modules/auth/password/update-password.dto';
import { UserDTO } from '~/types/modules/user/user.dto';

@ApiTags(ApiTag.AuthPassword)
@Controller(ApiTag.AuthPassword)
export class PasswordController {
  constructor(@Inject(PasswordService.token) private readonly passwordService: PasswordService) {}

  @Post('/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(ApiAuth.JWT)
  @ApiOperation({ summary: 'Update user password' })
  @ApiOkResponse({ description: 'Password updated successfully', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.AuthInvalidCredentials],
    notFoundCodes: [ErrorCode.UserNotFound],
    forbiddenCodes: [
      ErrorCode.AuthMfaVerificationRequired,
      ErrorCode.AuthMfaCodeRequired,
      ErrorCode.AuthMfaInvalidCode,
    ],
  })
  async updatePassword(@Req() req: AuthRequest, @Body() data: UpdatePasswordDTO) {
    const user = await this.passwordService.updatePassword(req.user.id, data);
    return UserDTO.fromModel(user);
  }
}
