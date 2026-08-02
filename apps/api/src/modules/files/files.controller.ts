import { ErrorCode } from '@ezinventory/shared/types/error-code';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotImplementedException,
  Param,
  ParseUUIDPipe,
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
  ApiPaginatedResponse,
  ApiResourceQuery,
  CheckPolicies,
  QueryDTO,
  ResourceQuery,
} from '@querry-kit/nest';
import { ApiAuth, ApiTag } from '~/config/api';
import { uploadFileOptions } from '~/config/file-upload';
import { ApiFile } from '~/decorators/params/api-file.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PoliciesGuard } from '~/guards/policies.guard';
import { FilesService } from '~/modules/files/files.service';
import { FileTypeMap } from '~/modules/files/types';
import { AuthRequest } from '~/types/auth-request';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { FilePayload } from '~/types/modules/files';
import { CreateFileDTO } from '~/types/modules/files/create-file.dto';
import { FileDTO } from '~/types/modules/files/file.dto';

@ApiTags(ApiTag.Files)
@ApiBearerAuth(ApiAuth.JWT)
@Controller(ApiTag.Files)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FilesController {
  constructor(@Inject(FilesService.token) private readonly filesService: FilesService) {}

  @Get('/')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Read, CaslSubject.File))
  @ApiOperation({ summary: 'Query files' })
  @ApiResourceQuery()
  @ApiPaginatedResponse({ description: 'Paginated files', model: FileDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
  })
  async query(@Req() req: AuthRequest, @Query() query: QueryDTO<FileTypeMap>) {
    return ResourceQuery.query({
      service: this.filesService,
      query,
      ability: req.ability,
      schema: FileDTO,
      map: (file: FilePayload, ability) => FileDTO.fromModel(file, ability),
    });
  }

  @Post('/')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Create, CaslSubject.File))
  @ApiOperation({ summary: 'Create a new file record' })
  @ApiCreatedResponse({
    description:
      'The created file record. Note that the file is not uploaded yet, this only creates the database record. You need to upload the file separately using the /:id/upload endpoint.',
    type: FileDTO,
  })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
  })
  async create(@Req() req: AuthRequest, @Body() data: CreateFileDTO) {
    const item = await this.filesService.create(data);
    return FileDTO.fromModel(item, req.ability);
  }

  @Put('/:id/upload')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Create, CaslSubject.File))
  @UseInterceptors(FileInterceptor('file', uploadFileOptions))
  @ApiFile('file')
  @ApiOperation({ summary: 'Upload a file to S3 and update the file record' })
  @ApiOkResponse({
    description: 'The updated file record after uploading the file to S3',
    type: FileDTO,
  })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    badRequestCodes: [
      ErrorCode.FileUploadNoFileProvided,
      ErrorCode.FileUploadAlreadyUploaded,
      ErrorCode.FileUploadInvalidFileType,
      ErrorCode.FileUploadFileTooLarge,
    ],
    notFoundCodes: [ErrorCode.FileNotFound],
    internalServerError: true,
  })
  async upload(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    const item = await this.filesService.uploadFile(id, file);
    return FileDTO.fromModel(item, req.ability);
  }

  async delete() {
    throw new NotImplementedException();
  }
}
