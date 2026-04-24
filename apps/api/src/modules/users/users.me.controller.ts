import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiTag } from '~/config/api';
import { uploadAvatarOptions } from '~/config/file-upload';
import { ApiFile } from '~/decorators/params/api-file.decorator';
import { ApiErrorResponses } from '~/decorators/responses/api-error-responses.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { UserPreferencesService } from '~/modules/users/user-preferences/user-preferences.service';
import { UserProfileService } from '~/modules/users/user-profile/user-profile.service';
import { UsersService } from '~/modules/users/users.service';
import { AuthRequest } from '~/types/auth-request';
import { ErrorCode } from '~/types/error-code';
import { UpdateUserPreferencesDTO } from '~/types/modules/user-preferences/update-user-preferences.dto';
import { UserPreferencesDTO } from '~/types/modules/user-preferences/user-preferences.dto';
import { UpdateUserProfileDTO } from '~/types/modules/user-profile/update-user-profile.dto';
import { UserProfileDTO } from '~/types/modules/user-profile/user-profile.dto';
import { UserDTO } from '~/types/modules/user/user.dto';

@ApiTags(ApiTag.UsersMe)
@Controller(ApiTag.UsersMe)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ApiAuth.JWT)
export class UsersMeController {
  constructor(
    @Inject(UsersService.token) private readonly usersService: UsersService,
    @Inject(UserPreferencesService.token)
    private readonly userPreferencesService: UserPreferencesService,
    @Inject(UserProfileService.token)
    private readonly userProfileService: UserProfileService,
  ) {}

  //#region preferences
  @Get('/preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiOkResponse({ description: 'User preferences', type: UserPreferencesDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
  })
  async getUserPreferences(@Req() req: AuthRequest) {
    const item = await this.userPreferencesService.getPreferences(req.user.id);
    return UserPreferencesDTO.fromModel(item);
  }

  @Patch('/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiOkResponse({ description: 'Updated user preferences', type: UserPreferencesDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
  })
  async updateUserPreferences(@Req() req: AuthRequest, @Body() data: UpdateUserPreferencesDTO) {
    const item = await this.userPreferencesService.updatePreferences(req.user.id, data);
    return UserPreferencesDTO.fromModel(item);
  }
  //#endregion
  //#region profile
  @Get('/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile', type: UserProfileDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
  })
  async getUserProfile(@Req() req: AuthRequest) {
    const item = await this.userProfileService.getProfile(req.user.id);
    return UserProfileDTO.fromModel(item);
  }

  @Patch('/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'Updated user profile', type: UserProfileDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
  })
  async updateUserProfile(@Req() req: AuthRequest, @Body() data: UpdateUserProfileDTO) {
    const item = await this.userProfileService.updateProfile(req.user.id, data);
    return UserProfileDTO.fromModel(item);
  }
  //#endregion
  //#region avatar
  @Put('/avatar')
  @UseInterceptors(FileInterceptor('file', uploadAvatarOptions))
  @ApiFile('file')
  @ApiOperation({ summary: 'Upload or update current user avatar' })
  @ApiOkResponse({ description: 'Updated user with new avatar', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    badRequestCodes: [
      ErrorCode.FileUploadInvalidFileType,
      ErrorCode.FileUploadNoFileProvided,
      ErrorCode.FileUploadFileTooLarge,
    ],
  })
  async uploadAvatar(@Req() req: AuthRequest, @UploadedFile('file') file: Express.Multer.File) {
    const item = await this.usersService.updateAvatar(req.user.id, file);
    return UserDTO.fromModel(item);
  }

  @Delete('/avatar')
  @ApiOperation({ summary: 'Delete current user avatar' })
  @ApiOkResponse({ description: 'Updated user', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
  })
  async deleteAvatar(@Req() req: AuthRequest) {
    const item = await this.usersService.deleteAvatar(req.user.id);
    return UserDTO.fromModel(item);
  }
  //#endregion
}
