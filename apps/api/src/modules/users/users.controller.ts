import { ErrorCode } from '@ezinventory/shared/types/error-code';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErrorResponses,
  ApiFieldsQuery,
  ApiPaginatedResponse,
  ApiParamId,
  ApiResourceQuery,
  CheckPolicies,
  FindByIdDTO,
  FindUniqueDTO,
  QueryDTO,
  ResourceQuery,
} from '@querry-kit/nest';
import { ApiAuth, ApiTag } from '~/config/api';
import { uploadAvatarOptions } from '~/config/file-upload';
import { ApiFile } from '~/decorators/params/api-file.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PoliciesGuard } from '~/guards/policies.guard';
import { UserTypeMap } from '~/modules/users/types';
import { UserPreferencesService } from '~/modules/users/user-preferences/user-preferences.service';
import { UserProfileService } from '~/modules/users/user-profile/user-profile.service';
import { UsersService } from '~/modules/users/users.service';
import { AuthRequest } from '~/types/auth-request';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { UserPayload } from '~/types/modules/user';
import { UpdateUserPreferencesDTO } from '~/types/modules/user-preferences/update-user-preferences.dto';
import { UserPreferencesDTO } from '~/types/modules/user-preferences/user-preferences.dto';
import { UpdateUserProfileDTO } from '~/types/modules/user-profile/update-user-profile.dto';
import { UserProfileDTO } from '~/types/modules/user-profile/user-profile.dto';
import { CreateUserDTO } from '~/types/modules/user/create-user.dto';
import { UpdateUserPasswordDTO } from '~/types/modules/user/update-user-password.dto';
import { UpdateUserDTO } from '~/types/modules/user/update-user.dto';
import { UserDTO } from '~/types/modules/user/user.dto';

@ApiTags(ApiTag.Users)
@ApiBearerAuth(ApiAuth.JWT)
@Controller(ApiTag.Users)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class UsersController {
  constructor(
    @Inject(UsersService.token) private readonly usersService: UsersService,
    @Inject(UserPreferencesService.token)
    private readonly userPreferencesService: UserPreferencesService,
    @Inject(UserProfileService.token) private readonly userProfileService: UserProfileService,
  ) {}

  //#region query
  @Get('/')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Read, CaslSubject.User))
  @ApiOperation({ summary: 'Query users' })
  @ApiResourceQuery()
  @ApiPaginatedResponse({ description: 'Paginated users', model: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
  })
  async queryUsers(@Req() req: AuthRequest, @Query() query: QueryDTO<UserTypeMap>) {
    return ResourceQuery.query({
      service: this.usersService,
      query,
      ability: req.ability,
      schema: UserDTO,
      include: { profile: true, preferences: true },
      map: (user: UserPayload, ability) => UserDTO.fromModel(user, ability),
    });
  }

  @Get('/find-by-id/:id')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Read, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to retrieve.' })
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiFieldsQuery()
  @ApiOkResponse({ description: 'User', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.ItemNotFound],
  })
  async findById(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FindByIdDTO<UserTypeMap>,
  ) {
    return ResourceQuery.findById({
      service: this.usersService,
      id,
      query,
      ability: req.ability,
      schema: UserDTO,
      include: { profile: true, preferences: true },
      map: (user: UserPayload, ability) => UserDTO.fromModel(user, ability),
    });
  }

  @Get('/find-unique')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Read, CaslSubject.User))
  @ApiOperation({ summary: 'Find unique user by field' })
  @ApiOkResponse({ description: 'Unique user', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.ItemNotFound],
  })
  async findUnique(@Req() req: AuthRequest, @Query() query: FindUniqueDTO<UserTypeMap>) {
    const item = await this.usersService.findUnique<UserPayload>(query, req.ability);
    return UserDTO.fromModel(item, req.ability);
  }
  //#endregion

  @Post('/')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Create, CaslSubject.User))
  @ApiOperation({ summary: 'Create new user' })
  @ApiCreatedResponse({ description: 'User created successfully', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    conflictCodes: [ErrorCode.UserConflictSameEmail],
  })
  async createUser(@Req() req: AuthRequest, @Body() data: CreateUserDTO) {
    const user = await this.usersService.create(data);
    return UserDTO.fromModel(user, req.ability);
  }

  @Patch('/:id')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to update.' })
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiOkResponse({ description: 'User updated successfully', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    badRequestCodes: [ErrorCode.UserArchived],
    notFoundCodes: [ErrorCode.UserNotFound],
  })
  async updateUser(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDTO,
  ) {
    const user = await this.usersService.update(id, data);
    return UserDTO.fromModel(user, req.ability);
  }

  @Patch('/:id/preferences')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to update preferences for.' })
  @ApiOperation({ summary: 'Update user preferences by ID' })
  @ApiOkResponse({ description: 'User preferences updated successfully', type: UserPreferencesDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.UserNotFound],
  })
  async updateUserPreferences(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserPreferencesDTO,
  ) {
    const preferences = await this.userPreferencesService.updatePreferences(id, data);
    return UserPreferencesDTO.fromModel(preferences, req.ability);
  }

  @Patch('/:id/profile')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to update profile for.' })
  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiOkResponse({ description: 'User profile updated successfully', type: UserProfileDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.UserNotFound],
  })
  async updateUserProfile(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserProfileDTO,
  ) {
    const profile = await this.userProfileService.updateProfile(id, data);
    return UserProfileDTO.fromModel(profile, req.ability);
  }

  @Patch('/:id/password')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to set a password for.' })
  @ApiOperation({ summary: 'Set user password by ID' })
  @ApiOkResponse({ description: 'User password updated successfully', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.UserNotFound],
  })
  async updateUserPassword(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserPasswordDTO,
  ) {
    const user = await this.usersService.setPassword(id, data);
    return UserDTO.fromModel(user, req.ability);
  }

  @Post('/:id/mfa/disable')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to disable MFA for.' })
  @ApiOperation({ summary: 'Disable MFA for a user by ID' })
  @ApiOkResponse({ description: 'User MFA disabled successfully', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.UserNotFound],
    conflictCodes: [ErrorCode.AuthMfaNotEnabled],
  })
  async disableUserMfa(@Req() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.disableMfa(id);
    return UserDTO.fromModel(user, req.ability);
  }

  @Delete('/:id')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Delete, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to delete.' })
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiOkResponse({ description: 'User deleted successfully', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.UserNotFound],
  })
  async deleteUser(@Req() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.deleteUser(id);
    return UserDTO.fromModel(user, req.ability);
  }

  @Put('/:id/avatar')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to upload avatar for.' })
  @UseInterceptors(FileInterceptor('file', uploadAvatarOptions))
  @ApiFile('file')
  @ApiOperation({ summary: 'Upload or update avatar of user by ID' })
  @ApiOkResponse({ description: 'Updated user with new avatar', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    badRequestCodes: [
      ErrorCode.FileUploadNoFileProvided,
      ErrorCode.FileUploadInvalidFileType,
      ErrorCode.FileUploadFileTooLarge,
      ErrorCode.UserArchived,
    ],
    notFoundCodes: [ErrorCode.UserNotFound],
  })
  async uploadAvatar(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    const item = await this.usersService.updateAvatar(id, file);
    return UserDTO.fromModel(item, req.ability);
  }

  @Delete('/:id/avatar')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to delete avatar for.' })
  @ApiOperation({ summary: 'Delete avatar of user by ID' })
  @ApiOkResponse({ description: 'Updated user', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.UserNotFound],
    badRequestCodes: [ErrorCode.UserArchived],
  })
  async deleteAvatar(@Req() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    const item = await this.usersService.deleteAvatar(id);
    return UserDTO.fromModel(item, req.ability);
  }
}
