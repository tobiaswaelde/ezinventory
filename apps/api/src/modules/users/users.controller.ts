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
import { ApiAuth, ApiTag } from '~/config/api';
import { uploadAvatarOptions } from '~/config/file-upload';
import { CheckPolicies } from '~/decorators/casl/check-policies.decorator';
import { ApiFile } from '~/decorators/params/api-file.decorator';
import { ApiParamId } from '~/decorators/params/api-param-id.decorator';
import { ApiErrorResponses } from '~/decorators/responses/api-error-responses.decorator';
import { ApiPaginatedResponse } from '~/decorators/responses/api-paginated-response.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PoliciesGuard } from '~/guards/policies.guard';
import { FindByIdDTO, FindUniqueDTO, QueryDTO } from '~/lib/query-service/types';
import { UserTypeMap } from '~/modules/users/types';
import { UserPreferencesService } from '~/modules/users/user-preferences/user-preferences.service';
import { UserProfileService } from '~/modules/users/user-profile/user-profile.service';
import { UsersService } from '~/modules/users/users.service';
import { AuthRequest } from '~/types/auth-request';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { UserPayload } from '~/types/modules/user';
import { UpdateUserPreferencesDTO } from '~/types/modules/user-preferences/update-user-preferences.dto';
import { UserPreferencesDTO } from '~/types/modules/user-preferences/user-preferences.dto';
import { UpdateUserProfileDTO } from '~/types/modules/user-profile/update-user-profile.dto';
import { UserProfileDTO } from '~/types/modules/user-profile/user-profile.dto';
import { CreateUserDTO } from '~/types/modules/user/create-user.dto';
import { UpdateUserDTO } from '~/types/modules/user/update-user.dto';
import { UserDTO } from '~/types/modules/user/user.dto';
import { PaginatedDTO } from '~/types/pagination/paginated.dto';

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
  @CheckPolicies((a) => a.can(CaslAction.Read, CaslSubject.User))
  @ApiOperation({ summary: 'Query users' })
  @ApiPaginatedResponse({ description: 'Paginated users', model: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
  })
  async queryUsers(@Req() req: AuthRequest, @Query() query: QueryDTO<UserTypeMap>) {
    const { items, pageMeta } = await this.usersService.query<UserPayload>({ ...query });
    return new PaginatedDTO(
      await Promise.all(items.map((x) => UserDTO.fromModel(x, req.ability))),
      pageMeta,
    );
  }

  @Get('/find-by-id/:id')
  @CheckPolicies((a) => a.can(CaslAction.Read, CaslSubject.User))
  @ApiParamId({ description: 'The ID of the user to retrieve.' })
  @ApiOperation({ summary: 'Find user by ID' })
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
    const item = await this.usersService.findById<UserPayload>(id, query);
    return UserDTO.fromModel(item, req.ability);
  }

  @Get('/find-unique')
  @CheckPolicies((a) => a.can(CaslAction.Read, CaslSubject.User))
  @ApiOperation({ summary: 'Find unique user by field' })
  @ApiOkResponse({ description: 'Unique user', type: UserDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.ItemNotFound],
  })
  async findUnique(@Req() req: AuthRequest, @Query() query: FindUniqueDTO<UserTypeMap>) {
    const item = await this.usersService.findUnique<UserPayload>(query);
    return UserDTO.fromModel(item, req.ability);
  }
  //#endregion

  @Post('/')
  @CheckPolicies((a) => a.can(CaslAction.Create, CaslSubject.User))
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
  @CheckPolicies((a) => a.can(CaslAction.Update, CaslSubject.User))
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
  @CheckPolicies((a) => a.can(CaslAction.Update, CaslSubject.User))
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
  @CheckPolicies((a) => a.can(CaslAction.Update, CaslSubject.User))
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

  @Delete('/:id')
  @CheckPolicies((a) => a.can(CaslAction.Delete, CaslSubject.User))
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
  @CheckPolicies((a) => a.can(CaslAction.Update, CaslSubject.User))
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
  @CheckPolicies((a) => a.can(CaslAction.Update, CaslSubject.User))
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
