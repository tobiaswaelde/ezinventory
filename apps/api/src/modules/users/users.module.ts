import { Module } from '@nestjs/common';
import { UserPreferencesService } from '~/modules/users/user-preferences/user-preferences.service';
import { UserProfileService } from '~/modules/users/user-profile/user-profile.service';
import { UsersController } from '~/modules/users/users.controller';
import { UsersMeController } from '~/modules/users/users.me.controller';
import { UsersService } from '~/modules/users/users.service';

@Module({
  providers: [
    { provide: UsersService.token, useClass: UsersService },
    { provide: UserPreferencesService.token, useClass: UserPreferencesService },
    { provide: UserProfileService.token, useClass: UserProfileService },
  ],
  controllers: [UsersMeController, UsersController],
})
export class UsersModule {}
