export enum ErrorCode {
	//#region common
	ItemAlreadyExists = 'common/already-exists',
	ItemNotFound = 'common/not-found',
	Unauthorized = 'auth/unauthorized',
	InsufficientPermissions = 'auth/insufficient-permissions',
	//#endregion
	//#region file upload
	FileNotFound = 'files/file-not-found',
	FileUploadNoFileProvided = 'files/no-file-provided',
	FileUploadInvalidFileType = 'files/invalid-file-type',
	FileUploadFileTooLarge = 'files/file-too-large',
	FileUploadAlreadyUploaded = 'files/already-uploaded',
	FileUploadProcessingError = 'files/processing-error',
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
	AuthPasswordResetTokenInvalid = 'auth/invalid-password-reset-token',
	AuthPasswordResetTokenExpired = 'auth/password-reset-token-expired',
	//#endregion
	//#region user
	UserNotFound = 'user/user-not-found',
	UserArchived = 'user/archived',
	UserConflictSameEmail = 'user/conflict-same-email',
	UserCreateBranchArchived = 'user/create-branch-archived',
	//#endregion
	//#region warehouses
	WarehouseNotFound = 'warehouses/not-found',
	WarehouseConflictSameName = 'warehouses/conflict-same-name',
	WarehouseMemberAlreadyExists = 'warehouses/member-already-exists',
	WarehouseMemberNotFound = 'warehouses/member-not-found',
	WarehouseMemberCannotRemoveLastAdmin = 'warehouses/cannot-remove-last-admin',
	//#endregion
}
