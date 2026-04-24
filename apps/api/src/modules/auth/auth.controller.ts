import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { instanceToPlain } from 'class-transformer';
import { ApiAuth, ApiTag } from '~/config/api';
import { ApiErrorResponses } from '~/decorators/responses/api-error-responses.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { LocalAuthGuard } from '~/guards/local-auth.guard';
import { AuthService } from '~/modules/auth/auth.service';
import { UsersService } from '~/modules/users/users.service';
import { AuthRequest } from '~/types/auth-request';
import { ErrorCode } from '~/types/error-code';
import { AuthResultDTO } from '~/types/modules/auth/auth-result.dto';
import { SigninDTO } from '~/types/modules/auth/signin.dto';
import { UserPayload } from '~/types/modules/user';
import { UserDTO } from '~/types/modules/user/user.dto';

@ApiTags(ApiTag.Auth)
@Controller(ApiTag.Auth)
export class AuthController {
  constructor(
    @Inject(AuthService.token) private readonly authService: AuthService,
    @Inject(UsersService.token) private readonly usersService: UsersService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(ApiAuth.JWT)
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ description: 'The current user', type: UserDTO })
  @ApiErrorResponses({ unauthorizedCodes: [ErrorCode.Unauthorized] })
  async getCurrentUser(@Req() req: AuthRequest) {
    const user = await this.usersService.findById<UserPayload>(req.user.id, {
      include: {
        profile: true,
        preferences: true,
      },
    });
    return instanceToPlain(UserDTO.fromModel(user));
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Sign in with email and password.' })
  @ApiOkResponse({ description: 'Signin successfull', type: AuthResultDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.AuthInvalidCredentials, ErrorCode.AuthMfaInvalidCode],
    forbiddenCodes: [
      ErrorCode.AuthMfaVerificationRequired,
      ErrorCode.AuthMfaCodeRequired,
      ErrorCode.AuthMfaInvalidCode,
    ],
    badRequestCodes: [ErrorCode.AuthMfaNotPending],
    tooManyRequestsCodes: [],
  })
  async signin(@Req() req: AuthRequest, @Body() data: SigninDTO) {
    const res = await this.authService.signinWithCredentials(req, data);
    return res;
  }
}
