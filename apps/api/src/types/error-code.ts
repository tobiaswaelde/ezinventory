export enum ErrorCode {
  //#region common
  ItemAlreadyExists = 'common/already-exists',
  ItemNotFound = 'common/not-found',
  Unauthorized = 'auth/unauthorized',
  InsufficientPermissions = 'auth/insufficient-permissions',
  //#endregion
  //#region file upload
  FileUploadNoFileProvided = 'file-upload/no-file-provided',
  FileUploadInvalidFileType = 'file-upload/invalid-file-type',
  FileUploadFileTooLarge = 'file-upload/file-too-large',
  FileUploadAlreadyUploaded = 'file-upload/already-uploaded',
  //#endregion
  //#region auth
  AuthInvalidCredentials = 'auth/invalid-credentials',
  AuthNoTokenProvided = 'auth/no-token-provided',
  AuthInvalidToken = 'auth/invalid-token',
  AuthTokenExpired = 'auth/token-expired',
  AuthMfaVerificationRequired = 'auth/mfa-verification-required',
  AuthMfaNotPending = 'auth/mfa-not-pending',
  AuthMfaCodeRequired = 'auth/mfa-code-required',
  AuthMfaInvalidCode = 'auth/invalid-mfa-code',
  AuthMfaAlreadyEnabled = 'auth/mfa-already-enabled',
  AuthMfaNotEnabled = 'auth/mfa-not-enabled',
  AuthPasskeyNoUserOrNoPasskeys = 'auth/no-user-or-no-passkeys',
  AuthPasskeyNotFound = 'auth/passkey-not-found',
  AuthPasskeyNoChallenge = 'auth/passkey-no-challenge',
  AuthPasskeyRegistrationVerificationFailed = 'auth/passkey-registration-verification-failed',
  AuthPasskeyAuthenticationVerificationFailed = 'auth/passkey-authentication-verification-failed',
  AuthPasswordResetTokenInvalid = 'auth/invalid-password-reset-token',
  AuthPasswordResetTokenExpired = 'auth/password-reset-token-expired',
  //#endregion
  //#region user
  UserNotFound = 'user/user-not-found',
  UserArchived = 'user/archived',
  UserConflictSameEmail = 'user/conflict-same-email',
  UserCreateBranchArchived = 'user/create-branch-archived',
  //#endregion
  //#region user role
  UserRoleNotFound = 'user-role/not-found',
  UserRoleConflictSameName = 'user-role/conflict-same-name',
  UserRoleConflictSamePermissions = 'user-role/conflict-same-permissions',
  UserRoleCannotUpdateSystemRoles = 'user-role/cannot-update-system-roles',
  UserRoleCannotDeleteSystemRoles = 'user-role/cannot-delete-system-roles',
  UserRoleCannotDeleteWithAssignedUsers = 'user-role/cannot-delete-with-assigned-users',
  UserRolePermissionDoesNotBelongToRole = 'user-role/permission-does-not-belong-to-role',
  //#endregion
  //#region branch
  BranchNotFound = 'branch/not-found',
  BranchArchived = 'branch/archived',
  BranchConflictSameName = 'branch/conflict-same-name',
  BranchDeleteIsMainBranch = 'branch/is-main-branch',
  BranchDeleteHasUsers = 'branch/has-users',
  //#endregion
  //#region unit
  UnitNotFound = 'unit/not-found',
  UnitConflictSameNameOrSymbol = 'unit/conflict-same-name-or-symbol',
  UnitCannotUpdateSystemUnits = 'unit/cannot-update-system-units',
  UnitCannotDeleteSystemUnits = 'unit/cannot-delete-system-units',
  //#endregion
  //#region tag
  TagNotFound = 'tag/not-found',
  TagArchived = 'tag/archived',
  TagConflictSameName = 'tag/conflict-same-name',
  //#endregion
  //#region team
  TeamNotFound = 'team/not-found',
  TeamArchived = 'team/archived',
  TeamConflictSameName = 'team/conflict-same-name',
  TeamCannotDeleteWithMembers = 'team/cannot-delete-with-members',
  TeamMemberAlreadyExists = 'team/member-already-exists',
  TeamMemberNotFound = 'team/member-not-found',
  TeamMemberCannotRemoveLastAdmin = 'team/member-cannot-remove-last-admin',
  //#endregion
  //#region feedback
  FeedbackNotFound = 'feedback/feedback-not-found',
  FeedbackCommentNotFound = 'feedback/comment/comment-not-found',
  FeedbackCommentCannotReplyToNestedComment = 'feedback/comment/cannot-reply-to-nested-comment',
  FeedbackCommentReplyDepthExceeded = 'feedback/comment/reply-depth-exceeded',
  FeedbackCommentNoAuthTenantIdRequired = 'feedback/comment/no-auth-tenant-id',
  //#endregion
  //#region file
  FileNotFound = 'file/file-not-found',
  //#endregion
  //#region time tracking
  UserTimeTrackingNotSetUp = 'time-tracking/user-time-tracking-not-set-up',
  //#region auto break rule
  AutoBreakRuleNotFound = 'time-tracking/auto-break-rule/not-found',
  AutoBreakRuleConflictSameDelay = 'time-tracking/auto-break-rule/conflict-same-delay',
  //#endregion
  //#region shift
  ShiftNotFound = 'time-tracking/shift/not-found',
  ShiftConflictSameName = 'time-tracking/shift/conflict-same-name',
  ShiftTimesInvalid = 'time-tracking/shift/invalid-times',
  ShiftBreakDurationInvalid = 'time-tracking/shift/invalid-break-duration',
  //#endregion
  //#region absence
  AbsenceNotFound = 'time-tracking/absence/not-found',
  AbsenceInvalidDates = 'time-tracking/absence/invalid-dates',
  AbsenceAlreadyInTargetStatus = 'time-tracking/absence/already-in-target-status',
  AbsenceCanOnlyDeleteRequested = 'time-tracking/absence/can-only-delete-requested',
  //#endregion
  //#region time entry
  TimeEntryNotFound = 'time-tracking/time-entry/not-found',
  TimeEntryCannotCreateOnClosedWorkday = 'time-tracking/time-entry/cannot-create-on-closed-workday',
  TimeEntryCannotUpdateOnClosedWorkday = 'time-tracking/time-entry/cannot-update-on-closed-workday',
  TimeEntryCannotDeleteOnClosedWorkday = 'time-tracking/time-entry/cannot-delete-on-closed-workday',
  TimeEntryInvalidTimes = 'time-tracking/time-entry/invalid-times',
  TimeEntryNoActiveEntry = 'time-tracking/time-entry/no-active-entry',
  TimeEntryActiveEntryWrongType = 'time-tracking/time-entry/active-entry-wrong-type',
  //#endregion
  //#region workday
  WorkdayNotFound = 'time-tracking/workday/not-found',
  WorkdayAlreadyClosed = 'time-tracking/workday/already-closed',
  //#endregion
  //#endregion

  //#region email
  EmailFailedToSend = 'email/failed-to-send-email',
  //#endregion
}
