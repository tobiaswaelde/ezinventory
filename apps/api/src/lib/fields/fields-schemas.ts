import { buildFieldSchemaFromDto } from '~/lib/fields/dto-schema';
import { AddressDTO } from '~/types/modules/address/address.dto';
import { AdminFeedbackCommentDTO } from '~/types/modules/admin/feedback/comment/feedback-comment.dto';
import { AdminFeedbackDTO } from '~/types/modules/admin/feedback/feedback.dto';
import { AdminFileDTO } from '~/types/modules/admin/file/file.dto';
import { UserLoginDTO } from '~/types/modules/auth/logins/user-login.dto';
import { BranchDTO } from '~/types/modules/branch/branch.dto';
import { BranchPreferencesDTO } from '~/types/modules/branch/preferences/branch-preferences.dto';
import { UnitDTO } from '~/types/modules/meta/units/unit.dto';
import { UserNotificationChannelOptionDTO } from '~/types/modules/notifications/notification-channel-option/user-notification-channel-option.dto';
import { NotificationDTO } from '~/types/modules/notifications/notification.dto';
import { RolePermissionDTO } from '~/types/modules/role-permissions/role-permission.dto';
import { TagDTO } from '~/types/modules/tags/tag.dto';
import { TeamDTO } from '~/types/modules/team/team.dto';
import { UsersOnTeamsDTO } from '~/types/modules/team/users-on-teams.dto';
import { AbsenceStatusChangeDTO } from '~/types/modules/time-tracking/absence-status-change/absence-status-change.dto';
import { AbsenceDTO } from '~/types/modules/time-tracking/absences/absence.dto';
import { AutoBreakRuleDTO } from '~/types/modules/time-tracking/auto-break-rules/auto-break-rule.dto';
import { OvertimeAdjustmentDTO } from '~/types/modules/time-tracking/overtime-adjustment/overtime-adjustment.dto';
import { ShiftDTO } from '~/types/modules/time-tracking/shifts/shift.dto';
import { TimeEntryDTO } from '~/types/modules/time-tracking/time-entries/time-entry.dto';
import { UserTimeAccountDTO } from '~/types/modules/time-tracking/user-time-account/user-time-account.dto';
import { UserTimeTrackingPolicyDTO } from '~/types/modules/time-tracking/user-time-tracking-policy/user-time-tracking-policy.dto';
import { VacationAdjustmentDTO } from '~/types/modules/time-tracking/vacation-adjustment/vacation-adjustment.dto';
import { WorkdayDTO } from '~/types/modules/time-tracking/workday/workday.dto';
import { UserPreferencesDTO } from '~/types/modules/user-preferences/user-preferences.dto';
import { UserProfileDTO } from '~/types/modules/user-profile/user-profile.dto';
import { UserRoleDTO } from '~/types/modules/user-roles/user-role.dto';
import { UserDTO } from '~/types/modules/user/user.dto';
import { PageMetaDTO } from '~/types/pagination/page-meta.dto';

export const FieldSchemas = {
  pageMeta: buildFieldSchemaFromDto(PageMetaDTO),
  address: buildFieldSchemaFromDto(AddressDTO),
  adminFile: buildFieldSchemaFromDto(AdminFileDTO),
  userProfile: buildFieldSchemaFromDto(UserProfileDTO),
  userPreferences: buildFieldSchemaFromDto(UserPreferencesDTO),
  user: buildFieldSchemaFromDto(UserDTO),
  userRole: buildFieldSchemaFromDto(UserRoleDTO),
  rolePermission: buildFieldSchemaFromDto(RolePermissionDTO),
  userLogin: buildFieldSchemaFromDto(UserLoginDTO),
  branch: buildFieldSchemaFromDto(BranchDTO),
  branchPreferences: buildFieldSchemaFromDto(BranchPreferencesDTO),
  team: buildFieldSchemaFromDto(TeamDTO),
  usersOnTeams: buildFieldSchemaFromDto(UsersOnTeamsDTO),
  tag: buildFieldSchemaFromDto(TagDTO),
  unit: buildFieldSchemaFromDto(UnitDTO),
  absence: buildFieldSchemaFromDto(AbsenceDTO),
  absenceStatusChange: buildFieldSchemaFromDto(AbsenceStatusChangeDTO),
  autoBreakRule: buildFieldSchemaFromDto(AutoBreakRuleDTO),
  overtimeAdjustment: buildFieldSchemaFromDto(OvertimeAdjustmentDTO),
  vacationAdjustment: buildFieldSchemaFromDto(VacationAdjustmentDTO),
  shift: buildFieldSchemaFromDto(ShiftDTO),
  timeEntry: buildFieldSchemaFromDto(TimeEntryDTO),
  workday: buildFieldSchemaFromDto(WorkdayDTO),
  userTimeAccount: buildFieldSchemaFromDto(UserTimeAccountDTO),
  userTimeTrackingPolicy: buildFieldSchemaFromDto(UserTimeTrackingPolicyDTO),
  notification: buildFieldSchemaFromDto(NotificationDTO),
  userNotificationChannelOption: buildFieldSchemaFromDto(UserNotificationChannelOptionDTO),
  adminFeedback: buildFieldSchemaFromDto(AdminFeedbackDTO),
  adminFeedbackComment: buildFieldSchemaFromDto(AdminFeedbackCommentDTO),
} as const;
