import { AxiosError, isAxiosError } from 'axios';
import { useToasts } from '~/composables/app/toasts';
import { ErrorCode } from '@ezinventory/shared/types/error-code';

/**
 * Composable for handling errors in a consistent way across the application.
 */
export const useErrors = () => {
  const { t } = useI18n();
  const toasts = useToasts();

  /**
   * Object containing user-friendly error messages for each error code, with support for internationalization.
   *
   * This also ensures that TypeScript will throw an error if we forget to add a message for a new error code, since the keys of this object are of type `ErrorCode`.
   */
  const errorMessages = computed<{ [key in ErrorCode]: string }>(() => ({
    //#region common
    [ErrorCode.ItemAlreadyExists]: t('common.errors.item-already-exists'),
    [ErrorCode.ItemNotFound]: t('common.errors.common/not-found'),
    [ErrorCode.Unauthorized]: t('common.errors.auth/unauthorized'),
    [ErrorCode.InsufficientPermissions]: t('common.errors.auth/insufficient-permissions'),
    //#endregion
    //#region files
    [ErrorCode.FileNotFound]: t('common.errors.files/file-not-found'),
    [ErrorCode.FileUploadNoFileProvided]: t('common.errors.files/no-file-provided'),
    [ErrorCode.FileUploadInvalidFileType]: t('common.errors.files/invalid-file-type'),
    [ErrorCode.FileUploadFileTooLarge]: t('common.errors.files/file-too-large'),
    [ErrorCode.FileUploadAlreadyUploaded]: t('common.errors.files/already-uploaded'),
    [ErrorCode.FileUploadProcessingError]: t('common.errors.files/processing-error'),
    //#endregion
    //#region  auth
    [ErrorCode.AuthInvalidCredentials]: t('common.errors.auth/invalid-credentials'),
    [ErrorCode.AuthNoTokenProvided]: t('common.errors.auth/no-token-provided'),
    [ErrorCode.AuthInvalidToken]: t('common.errors.auth/invalid-token'),
    [ErrorCode.AuthTokenExpired]: t('common.errors.auth/token-expired'),
    [ErrorCode.AuthMfaVerificationRequired]: t('common.errors.auth/mfa-verification-required'),
    [ErrorCode.AuthMfaNotPending]: t('common.errors.auth/mfa-not-pending'),
    [ErrorCode.AuthMfaCodeRequired]: t('common.errors.auth/mfa-code-required'),
    [ErrorCode.AuthMfaInvalidCode]: t('common.errors.auth/invalid-mfa-code'),
    [ErrorCode.AuthMfaAlreadyEnabled]: t('common.errors.auth/mfa-already-enabled'),
    [ErrorCode.AuthMfaNotEnabled]: t('common.errors.auth/mfa-not-enabled'),
    [ErrorCode.AuthPasswordResetTokenInvalid]: t('common.errors.auth/invalid-password-reset-token'),
    [ErrorCode.AuthPasswordResetTokenExpired]: t('common.errors.auth/password-reset-token-expired'),
    //#endregion
    //#region user
    [ErrorCode.UserNotFound]: t('common.errors.user/user-not-found'),
    [ErrorCode.UserArchived]: t('common.errors.user/archived'),
    [ErrorCode.UserConflictSameEmail]: t('common.errors.user/conflict-same-email'),
    [ErrorCode.UserCreateBranchArchived]: t('common.errors.user/create-branch-archived'),
    //#endregion
    //#region warehouses
    [ErrorCode.WarehouseNotFound]: t('common.errors.warehouses/not-found'),
    [ErrorCode.WarehouseConflictSameName]: t('common.errors.warehouses/conflict-same-name'),
    [ErrorCode.WarehouseMemberAlreadyExists]: t('common.errors.warehouses/member-already-exists'),
    [ErrorCode.WarehouseMemberNotFound]: t('common.errors.warehouses/member-not-found'),
    [ErrorCode.WarehouseMemberCannotRemoveLastAdmin]: t('common.errors.warehouses/cannot-remove-last-admin'),
    //#endregion
  }));

  /**
   * Extracts a user-friendly error message from an error object, with support for internationalization.
   * @param {unknown} err The error object to extract the message from, which can be of any type but is expected to be an AxiosError for API-related errors.
   * @param {string} [fallbackMessage] An optional fallback message to use if the error does not match any known error codes. If not provided, a generic "something went wrong" message will be used.
   * @returns {string} A user-friendly error message, either specific to the error or a generic fallback message.
   */
  const getErrorMessage = (err: unknown, fallbackMessage?: string): string => {
    // if (isAxiosError(err)) {
    //   const message = err.response?.data.message;
    //   if (typeof message === 'string' && errorMessages.value[message as ErrorCode]) {
    //     return errorMessages.value[message as ErrorCode];
    //   }
    // }
    if (err instanceof AxiosError) {
      const message = err.response?.data?.message;
      if (typeof message === 'string' && errorMessages.value[message as ErrorCode]) {
        return errorMessages.value[message as ErrorCode];
      }
    }

    // fallback message
    return fallbackMessage ?? t('common.errors.something-went-wrong');
  };

  /**
   * Handles an error by extracting a user-friendly message and displaying it as a toast notification.
   * @param {unknown} err The error object to handle, which can be of any type but is expected to be an AxiosError for API-related errors.
   * @param {string} [fallbackMessage] An optional fallback message to use if the error does not match any known error codes. If not provided, a generic "something went wrong" message will be used.
   */
  const handleError = (err: unknown, fallbackMessage?: string) => {
    const message = getErrorMessage(err, fallbackMessage);
    toasts.error(message);
  };

  return {
    getErrorMessage,
    handleError,
  };
};
