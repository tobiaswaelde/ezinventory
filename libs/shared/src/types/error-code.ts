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
}
